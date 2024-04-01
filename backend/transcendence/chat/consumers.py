from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from datetime import datetime
from notify.consumer import NotifyConsumer
from channels.db import database_sync_to_async
from members.models import Members
from social.models import Block
import json
import redis

# Redis 클라이언트 설정
redis_client = redis.Redis(host='redis', port=6379, db=0)

def json_encode(data):
    return json.dumps(data, ensure_ascii=False)

# 메시지 타임스탬프를 float로 변환하는 함수
def parse_timestamp_to_float(timestamp_str):
    # ISO 8601 형식의 문자열을 datetime 객체로 변환
    dt = datetime.fromisoformat(timestamp_str)
    # datetime 객체를 Unix 타임스탬프(float)로 변환
    return dt.timestamp()

class ChatConsumer(NotifyConsumer):
	async def receive(self, text_data):
		data = json.loads(text_data)
		action = data['action']

		if action == 'fetch_chat_list':
			await self.fetch_chat_list()
		elif action == 'send_message':
			await self.send_message(data)
		elif action == 'fetch_messages':
			await self.fetch_messages(data)
		elif action == 'update_read_time':
			await self.update_read_time(data)

	async def fetch_chat_list(self):
		user_id = self.user.id
		chat_list = await self.get_chat_list(user_id)
		chats_info = []
		for room_name in chat_list:
			_, other_user_id = room_name.split('_')[1:]  # A와 B 중 나머지 하나
			other_user_id = int(other_user_id) if other_user_id != str(user_id) else int(_)
			# 차단한 유저의 채팅방은 가져오지 않음
			if await self.is_blocked(user_id, other_user_id):
				continue
			unread_count = await self.get_unread_messages_count(user_id, room_name)
			user_info = await self.get_member_info(other_user_id)
			chats_info.append({
				"room_name": room_name,
				"unread_messages_count": unread_count,
				"user_info" : user_info,
			})

		# 클라이언트에 채팅 목록과 각 채팅방의 안 읽은 메시지 수 전송
		await self.send(text_data=json_encode({
			"action": "fetch_chat_list",
			"data": chats_info
		}))

	async def send_message(self, data):
		sender_id = data['sender_id']
		receiver_id = data['receiver_id']

		#TODO: 프론트에서 유저 상태 관리를 하도록 하고, 
		# 만약 프론트에서 걸러지지 않아 서버로 요청이 왔다면 다시 유저의 상태를 업데이트 하는 로직으로 변경
		if await self.is_blocked(sender_id, receiver_id):
			await self.send(text_data=json_encode({
				"status": "fail",
				"message": "차단한 유저에겐 메세지를 보낼 수 없습니다."
			}))
			return

		receiver_online = await self.is_user_online(receiver_id)

		if receiver_online:
			room_name = await self.get_or_create_room(sender_id, receiver_id)

			sender_info = await self.get_member_info(sender_id)
			receiver_info = await self.get_member_info(receiver_id)
			message = data['message']

			# 메시지 데이터에 발신자와 수신자의 프로필 정보 포함
			message_data = {
				"sender": sender_info,
				"receiver": receiver_info,
				"message": message,
				"timestamp": datetime.utcnow().isoformat()
			}

			await self.store_message(room_name, message_data)

			# 보내는 유저는 차단하지 않고, 받는 유저가 보내는 유저를 차단한 경우는 메세지가 보내지지 않도록 함
			# 차단을 푼 경우에는 메세지가 보이도록 해야하므로 저장까지는 함
			if await self.is_blocked(receiver_id, sender_id):
				return

			receiver_channels = await self.get_channel_names(receiver_id)

			for channel_name in receiver_channels:
				await self.channel_layer.send(
					channel_name,
					{
						"type": "notify_new_chat",
						"sender_info": sender_info,
					}
				)
				await self.channel_layer.send(
					channel_name,
					{
						"type": "receive_message",
						"message_data": message_data,
					}
				)
		else:
			await self.send(text_data=json_encode({
				"status": "fail",
				"message": "현재 오프라인 상태의 유저입니다."
			}))
		
	async def receive_message(self, event):
		message_data = event['message_data']

		await self.send(text_data=json_encode({
			"action": "receive_message",
			**message_data,
		}))

	async def fetch_messages(self, data):
		room_name = data['room_name']
		# TODO: 채팅방에 들어갔을 때 메세지를 받아오는 메서드, 차단 여부를 검사할지?
		messages = await self.load_messages(room_name)

		await self.update_last_read_time(self.user.id, room_name)

		# 클라이언트에게 메시지 목록 전송
		await self.send(text_data=json_encode({
			"action": "fetch_messages",
			"room_name": room_name,
			"messages": messages
		}))
	
	async def update_read_time(self, data):
		room_name = data['room_name']

		await self.update_last_read_time(self.user.id, room_name)

	@sync_to_async
	def load_messages(self, room_name):
		# Redis에서 해당 채팅방의 모든 메시지 불러오기
		messages = redis_client.lrange(f"chat_messages:{room_name}", 0, -1)
		return [json.loads(message) for message in messages]


	async def chat_message(self, event):
		await self.send(text_data=json_encode({
			event['message']
		}))

	@sync_to_async
	def get_unread_messages_count(self, user_id, room_name):
		# 사용자가 마지막으로 읽은 시간 가져오기
		last_read_time = redis_client.get(f"last_read_time:{room_name}:{user_id}")
		if not last_read_time:
			last_read_time = 0
		# 마지막으로 읽은 시간 이후의 메시지 수 계산
		messages = redis_client.lrange(f"chat_messages:{room_name}", 0, -1)
		unread_count = sum(1 for message in messages if parse_timestamp_to_float(json.loads(message)['timestamp']) > float(last_read_time))
		return unread_count

	@sync_to_async
	def get_or_create_room(self, sender_id, receiver_id):
		room_name = f"chat_{min(sender_id, receiver_id)}_{max(sender_id, receiver_id)}"
		
		# 채팅방이 존재하지 않으면 생성
		if not redis_client.exists(room_name):
			redis_client.set(room_name, json_encode([]))
			# 채팅방에 A와 B를 참여시킴
		redis_client.sadd(f"user_chats:{sender_id}", room_name)
		redis_client.sadd(f"user_chats:{receiver_id}", room_name)

		return room_name

	@sync_to_async
	def store_message(self, room_name, message):
		# Redis 리스트에 메시지 저장
		redis_client.rpush(f"chat_messages:{room_name}", json_encode(message))
		
		# 메시지 리스트의 크기를 제한 (최신 500개의 메시지만 유지)
		redis_client.ltrim(f"chat_messages:{room_name}", -500, -1)

	@database_sync_to_async
	def get_member_info(self, user_id):
		try:
			member = Members.objects.get(id=user_id)
			return {
				"user_id": member.id,
				"nickname": member.nickname,
				"image_url": member.image_url
			}
		except Members.DoesNotExist:
			return {
				"status": "fail",
				"message": "Member does not exist."
			}

	@sync_to_async
	def update_last_read_time(self, user_id, room_name):
		# 현재 시간을 Unix 타임스탬프로 변환
		current_time = datetime.utcnow().timestamp()
		# 마지막으로 읽은 시간을 Redis에 저장
		redis_client.set(f"last_read_time:{room_name}:{user_id}", current_time)

	@database_sync_to_async
	def is_blocked(self, user_id, target_id):
		# user가 target을 차단했는지 확인
		return Block.objects.filter(user_id=user_id, target_id=target_id).exists()
