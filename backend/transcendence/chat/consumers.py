from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from members.models import Members
from social.models import Block
from utils import json_encode, parse_timestamp_to_float, get_member_info, get_chat_channel_names, is_user_online, is_user_blocked
from utils import notify_chat_send
import json
import redis

# Redis 클라이언트 설정
redis_client = redis.Redis(host='redis', port=6379, db=0)

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope["user"]
		await self.accept()

		user_id = self.user.id

		await self.add_chat_channel_name(user_id, self.channel_name)

	async def disconnect(self, close_code):
		user_id = self.user.id
		await self.remove_chat_channel_name(user_id, self.channel_name)

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
		elif action == 'leave_chat_room':
			await self.leave_chat_room(data)
		elif action == 'fetch_bot_notify_messages':
			await self.get_bot_notify_messages(data)

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
			user_info = await get_member_info(other_user_id)
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
		
		if not await is_user_online(receiver_id):
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
		
		await self.rejoin_chat_room(sender_id, room_name)
		
		sender_info = await get_member_info(sender_id)
		receiver_info = await get_member_info(receiver_id)
		message_data = self.create_message_data(sender_info, receiver_info, data)
		await self.store_message(room_name, message_data)

		if await self.is_blocked(receiver_id, sender_id):
			return  # 차단된 경우, 메시지는 저장하지만 전송하지 않음

		await self.notify_receiver(receiver_id, sender_info, message_data)

	async def notify_receiver(self, receiver_id, sender_info, message_data):
		receiver_channels = await get_chat_channel_names(receiver_id)

		await notify_chat_send(self, receiver_id, sender_info)

		for channel_name in receiver_channels:
			await self.channel_layer.send(channel_name, {"type": "receive_message", "message_data": message_data})

	def create_message_data(self, sender_info, receiver_info, data):
		return {
			"sender": sender_info,
			"receiver": receiver_info,
			"message": data['message'],
			"timestamp": data['timestamp'],
		}
		
	async def receive_message(self, event):
		message_data = event['message_data']

		await self.send(text_data=json_encode({
			"action": "receive_message",
			**message_data,
		}))

	async def bot_chat(self, event):
		await self.send(text_data=json_encode({
			**event['data']
		}))

	async def enter_chat_room(self, data):
		room_name = data['room_name']
		timestamp = data['timestamp']
		user_id = self.user.id

		_, other_user_id = room_name.split('_')[1:]  # A와 B 중 나머지 하나
		other_user_id = int(other_user_id) if other_user_id != str(user_id) else int(_)

		await self.notify_chat_partners_status(user_id, other_user_id)
		await self.rejoin_chat_room(user_id, room_name)

		messages = await self.load_messages(user_id, room_name)

		await self.update_last_read_time(user_id, room_name, timestamp)

		# 클라이언트에게 메시지 목록 전송
		await self.send(text_data=json_encode({
			"action": "fetch_messages",
			"room_name": room_name,
			"messages": messages,
		}))
	
	async def update_read_time(self, data):
		room_name = data['room_name']
		timestamp = data['timestamp']

		await self.update_last_read_time(self.user.id, room_name, timestamp)

	async def leave_chat_room(self, data):
		user_id = self.user.id
		room_name = data['room_name']
		timestamp = data['timestamp']

		await self.remove_user_from_chat(user_id, room_name)
		await self.set_left_time(user_id, room_name, timestamp)

		# 모든 사용자가 채팅방을 나갔는지 확인
		if await self.is_room_empty(room_name):
			await self.delete_chat_history(room_name)
			
	@sync_to_async
	def set_left_time(self, user_id, room_name, timestamp):
		redis_client.set(f"left_time:{room_name}:{user_id}", timestamp)

	@sync_to_async
	def remove_user_from_chat(self, user_id, room_name):
		# 유저를 채팅방에서 제거하고 나간 상태를 기록
		redis_client.srem(f"user_chats:{user_id}", room_name)
		redis_client.sadd(f"left_chat_rooms:{user_id}", room_name)

	@sync_to_async
	def is_room_empty(self, room_name):
		_, other_user_id = room_name.split('_')[1:]  # A와 B 중 나머지 하나
		other_user_id = int(other_user_id) if other_user_id != str(self.user.id) else int(_)

		# 채팅방에 남아있는 유저가 있는지 확인
		user = redis_client.sismember(f"user_chats:{self.user.id}", room_name)
		other_user = redis_client.sismember(f"user_chats:{other_user_id}", room_name)
		return user == False and other_user == False

	@sync_to_async
	def delete_chat_history(self, room_name):
		# 채팅방의 대화 기록 삭제
		redis_client.delete(f"chat_messages:{room_name}")

	@sync_to_async
	def get_chat_list(self, user_id):
		# 사용자가 나간 채팅방은 제외하고 채팅방 목록 가져오기
		chat_room_names = redis_client.smembers(f"user_chats:{user_id}")
		left_rooms = redis_client.smembers(f"left_chat_rooms:{user_id}")
		active_rooms = chat_room_names - left_rooms
		# 바이트 문자열을 문자열로 디코딩
		chat_rooms = [room_name.decode('utf-8') for room_name in active_rooms]
		return chat_rooms

	@sync_to_async
	def load_messages(self, user_id, room_name):
		# 유저의 마지막 참여 시점 가져오기
		left_time = redis_client.get(f"left_time:{room_name}:{user_id}")
		if left_time is None or 0:
			left_time = 0
		else:
			left_time = parse_timestamp_to_float(left_time.decode('utf-8'))

		# 해당 시점 이후의 메시지만 필터링하여 불러오기
		messages = redis_client.lrange(f"chat_messages:{room_name}", 0, -1)
		filtered_messages = [
			json.loads(message) for message in messages 
			if parse_timestamp_to_float(json.loads(message)['timestamp']) > left_time]

		return filtered_messages

	@sync_to_async
	def rejoin_chat_room(self, user_id, room_name):
		if redis_client.sismember(f"left_chat_rooms:{user_id}", room_name):
			# 유저가 나간 채팅방 목록에서 해당 채팅방을 제거
			redis_client.srem(f"left_chat_rooms:{user_id}", room_name)
			# 유저 채팅방 목록에 다시 추가
			redis_client.sadd(f"user_chats:{user_id}", room_name)

	@sync_to_async
	def get_unread_messages_count(self, user_id, room_name):
		# 사용자가 마지막으로 읽은 시간 가져오기
		last_read_time = redis_client.get(f"last_read_time:{room_name}:{user_id}")
		if not last_read_time:
			last_read_time = 0
		else:
			last_read_time = parse_timestamp_to_float(last_read_time.decode('utf-8'))
		# 마지막으로 읽은 시간 이후의 메시지 수 계산
		messages = redis_client.lrange(f"chat_messages:{room_name}", 0, -1)
		unread_count = sum(1 for message in messages if parse_timestamp_to_float(json.loads(message)['timestamp']) > last_read_time)
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

	@sync_to_async
	def update_last_read_time(self, user_id, room_name, time):
		# 마지막으로 읽은 시간을 Redis에 저장
		redis_client.set(f"last_read_time:{room_name}:{user_id}", time)

	@database_sync_to_async
	def is_blocked(self, user_id, target_id):
		# user가 target을 차단했는지 확인
		return Block.objects.filter(user_id=user_id, target_id=target_id).exists()

	@sync_to_async
	def add_chat_channel_name(self, user_id, channel_name):
		redis_client.sadd(f"user_chat_channels_{user_id}", channel_name)

	@sync_to_async
	def remove_chat_channel_name(self, user_id, channel_name):
		redis_client.srem(f"user_chat_channels_{user_id}", channel_name)

	@sync_to_async
	def delete_user_chats(self, user_id):
		redis_client.delete(f"user_chats:{user_id}")

	@sync_to_async
	def get_chat_list(self, user_id):
		chat_room_names = redis_client.smembers(f"user_chats:{user_id}")
		# 바이트 문자열을 문자열로 디코딩
		chat_rooms = [room_name.decode('utf-8') for room_name in chat_room_names]
		return chat_rooms

	@sync_to_async
	def delete_user_chats(self, user_id):
		redis_client.delete(f"user_chats:{user_id}")

	async def notify_chat_partners_status(self, user_id, partner_id):
		is_online = await is_user_online(partner_id)
		is_blocked = await is_user_blocked(user_id, partner_id)

		# 클라이언트에게 상태 정보 전송
		await self.send(text_data=json_encode({
			"action": "notify_chat_partner_status",
			"partner_id": partner_id,
			"is_online": is_online,
			"is_blocked": is_blocked,
		}))

	async def user_online(self, event):
		user_id = event['user_id']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json_encode({
			'action': 'update_user_status',
			'user_id': user_id,
			'status': Members.Status.ONLINE,
		}))
	
	async def user_offline(self, event):
		user_id = event['user_id']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json_encode({
			'action': 'update_user_status',
			'user_id': user_id,
			'status': Members.Status.OFFLINE,
		}))

	# bot 메세지 리스트 가져오기
	async def get_bot_notify_messages(self, data):
		user_id = data["user_id"]

		bot_notitfy_messages = redis_client.lrange(f"bot_notify_messages:{user_id}", 0, -1)
		result = [json.loads(message) for message in bot_notitfy_messages]

		await self.send(text_data=json_encode({
			'action': 'fetch_bot_notify_messages',
			'user_id': user_id,
			'data': result,
		}))
