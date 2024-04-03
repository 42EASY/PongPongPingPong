from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from datetime import datetime
from channels.db import database_sync_to_async
from members.models import Members
from social.models import Block
import json
import redis

# Redis 클라이언트 설정
redis_client = redis.Redis(host='redis', port=6379, db=0)

def json_encode(data):
	try:
		return json.dumps(data, ensure_ascii=False)
	except (TypeError, ValueError) as e:
		print(f"JSON encoding error: {e}")
		return None

# 메시지 타임스탬프를 float로 변환하는 함수
def parse_timestamp_to_float(timestamp_str):
	try:
		dt = datetime.fromisoformat(timestamp_str)
		return dt.timestamp()
	except ValueError as e:
		print(f"Timestamp parsing error: {e}")
		return None

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope["user"]
		await self.accept()

		user_id = self.user.id

		await self.add_channel_name(user_id, self.channel_name)

	async def disconnect(self, close_code):
		user_id = self.user.id
		await self.remove_channel_name(user_id, self.channel_name)

	async def receive(self, text_data):
		data = json.loads(text_data)
		action = data['action']

		if action == 'fetch_chat_list':
			await self.fetch_chat_list()
		elif action == 'send_message':
			await self.send_message(data)
		elif action == 'enter_chat_room':
			await self.enter_chat_room(data)
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

		if await self.is_blocked(sender_id, receiver_id):
			return await self.send_fail_message("blocked_chat_user", "차단한 유저에겐 메세지를 보낼 수 없습니다.")
		
		if not await self.is_user_online(receiver_id):
			return await self.send_fail_message("offline_chat_user", "현재 오프라인 상태의 유저입니다.")

		await self.process_message_sending(sender_id, receiver_id, data)

	async def send_fail_message(self, error_type, message):
		await self.send(text_data=json_encode({
			"status": "fail",
			"type": error_type,
			"message": message
		}))

	async def process_message_sending(self, sender_id, receiver_id, data):
		room_name = await self.get_or_create_room(sender_id, receiver_id)
		sender_info = await self.get_member_info(sender_id)
		receiver_info = await self.get_member_info(receiver_id)
		message_data = self.create_message_data(sender_info, receiver_info, data['message'])
		await self.store_message(room_name, message_data)

		if await self.is_blocked(receiver_id, sender_id):
			return  # 차단된 경우, 메시지는 저장하지만 전송하지 않음

		await self.notify_receiver(receiver_id, sender_info, message_data)

	async def notify_receiver(self, receiver_id, sender_info, message_data):
		receiver_channels = await self.get_channel_names(receiver_id)
		for channel_name in receiver_channels:
			await self.channel_layer.send(channel_name, {"type": "notify_new_chat", "sender_info": sender_info})
			await self.channel_layer.send(channel_name, {"type": "receive_message", "message_data": message_data})

	def create_message_data(self, sender_info, receiver_info, message):
		return {
			"sender": sender_info,
			"receiver": receiver_info,
			"message": message,
			"timestamp": datetime.utcnow().isoformat()
		}
		
	async def receive_message(self, event):
		message_data = event['message_data']

		await self.send(text_data=json_encode({
			"action": "receive_message",
			**message_data,
		}))

	async def enter_chat_room(self, data):
		room_name = data['room_name']

		_, other_user_id = room_name.split('_')[1:]  # A와 B 중 나머지 하나
		other_user_id = int(other_user_id) if other_user_id != str(self.user.id) else int(_)

		is_online, is_blocked = await self.notify_chat_partners_status(self.user.id, other_user_id)

		if (is_online == False):
			return await self.send_fail_message("offline_chat_user", "현재 오프라인 상태의 유저입니다.")
		
		if (is_blocked == True):
			return await self.send_fail_message("blocked_chat_user", "차단한 유저에겐 메세지를 보낼 수 없습니다.")

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

	@sync_to_async
	def add_channel_name(self, user_id, channel_name):
		redis_client.sadd(f"user_channels_{user_id}", channel_name)

	@sync_to_async
	def remove_channel_name(self, user_id, channel_name):
		redis_client.srem(f"user_channels_{user_id}", channel_name)

	@sync_to_async
	def delete_user_chats(self, user_id):
		redis_client.delete(f"user_chats:{user_id}")

	@sync_to_async
	def get_channel_names(self, user_id):
		channel_names_bytes = redis_client.smembers(f"user_channels_{user_id}")
		channel_names = {name.decode('utf-8') for name in channel_names_bytes}
		return channel_names

	@sync_to_async
	def get_chat_list(self, user_id):
		chat_room_names = redis_client.smembers(f"user_chats:{user_id}")
		# 바이트 문자열을 문자열로 디코딩
		chat_rooms = [room_name.decode('utf-8') for room_name in chat_room_names]
		return chat_rooms

	@sync_to_async
	def is_user_online(self, user_id):
		return redis_client.sismember("online_users", user_id)

	async def notify_new_chat(self, event):
		sender_info = event['sender_info']
		await self.send(text_data=json_encode({
			"action": "notify_new_chat",
			"sender": sender_info
		}))
	
	@sync_to_async
	def delete_user_chats(self, user_id):
		redis_client.delete(f"user_chats:{user_id}")

	@sync_to_async
	def get_user_online_status(self, partner_id):
		return Members.objects.filter(id=partner_id, status='ONLINE').exists()

	
	async def notify_chat_partners_status(self, user_id, partner_id):
		is_online = await self.is_user_online(partner_id)
		is_blocked = await self.is_user_blocked(user_id, partner_id)

		# 클라이언트에게 상태 정보 전송
		await self.send(text_data=json_encode({
			"action": "notify_chat_partner_status",
			"partner_id": partner_id,
			"is_online": is_online,
			"is_blocked": is_blocked,
		}))

		return is_online, is_blocked

	@database_sync_to_async
	def is_user_blocked(self, user_id, partner_id):
		return Block.objects.filter(user_id=user_id, target_id=partner_id).exists()

	async def user_online(self, event):
		user_id = event['user_id']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json_encode({
			'action': 'update_user_status',
			'user_id': user_id,
			'status': 'ONLINE',
		}))
	
	async def user_offline(self, event):
		user_id = event['user_id']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json_encode({
			'action': 'update_user_status',
			'user_id': user_id,
			'status': 'OFFLINE',
		}))
