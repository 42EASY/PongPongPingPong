from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from social.models import Friend
import json
import redis

redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0)

class NotifyConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope["user"]
		await self.accept()

		if self.user.is_authenticated:
			await self.add_channel_name(self.user.id, self.channel_name)
			# 사용자를 온라인으로 표시하는 로직
			await self.mark_user_online(self.user.id)
			# 친구들에게 사용자의 상태 변경 알림
			await self.notify_friends_user_online(self.user.id)

	async def disconnect(self, close_code):
		user_id = self.user.id
		await self.remove_channel_name(user_id, self.channel_name)

		channel_set_size = await self.get_channel_set_size(user_id)

		if channel_set_size == 0:
			# 사용자를 오프라인으로 표시하는 로직
			await self.mark_user_offline(user_id)
			# 사용자 채팅룸 가져오기
			user_chat_rooms = await self.get_chat_list(user_id)
			for room_name in user_chat_rooms:
				await self.delete_chat_room_if_empty(room_name)
			# 유저 채팅방 삭제
			await self.delete_user_chats(user_id)
			# 사용자의 친구들에게 사용자가 오프라인임을 알림
			await self.notify_friends_user_offline(user_id)
	
	@sync_to_async
	def add_channel_name(self, user_id, channel_name):
		redis_client.sadd(f"user_channels_{user_id}", channel_name)

	@sync_to_async
	def remove_channel_name(self, user_id, channel_name):
		redis_client.srem(f"user_channels_{user_id}", channel_name)

	@sync_to_async
	def get_channel_set_size(self, user_id):
		return redis_client.scard(f"user_channels_{user_id}")
	
	@sync_to_async
	def mark_user_online(self, user_id):
		# Redis를 이용해 사용자를 온라인으로 표시
		redis_client.sadd("online_users", user_id)

	@sync_to_async
	def mark_user_offline(self, user_id):
		# Redis를 이용해 사용자를 오프라인으로 표시
		redis_client.srem("online_users", user_id)

	@sync_to_async
	def delete_user_chats(self, user_id):
		redis_client.delete(f"user_chats:{user_id}")

	@sync_to_async
	def get_channel_names(self, user_id):
		channel_names_bytes = redis_client.smembers(f"user_channels_{user_id}")
		channel_names = {name.decode('utf-8') for name in channel_names_bytes}
		return channel_names

	@database_sync_to_async
	def get_user_friends(self, user_id):
		# 사용자의 친구 목록 조회
		friends = Friend.objects.filter(user_id=user_id).values_list('target', flat=True)
		return list(friends)

	@sync_to_async
	def get_chat_list(self, user_id):
		chat_room_names = redis_client.smembers(f"user_chats:{user_id}")
		# 바이트 문자열을 문자열로 디코딩
		chat_rooms = [room_name.decode('utf-8') for room_name in chat_room_names]
		return chat_rooms

	async def delete_chat_room_if_empty(self, room_name):
		# room_name ex) chat_1_2
		_, user_id_str, other_user_id_str = room_name.split('_')

		# 문자열에서 정수로 변환
		user_id = int(user_id_str)
		other_user_id = int(other_user_id_str)

		# 사용자 온라인 상태 확인
		user_online = await self.is_user_online(user_id)
		other_user_online = await self.is_user_online(other_user_id)

		if not user_online and not other_user_online:
			# 두 사용자 모두 오프라인인 경우, 채팅방 메시지 삭제
			redis_client.delete(f"chat_messages:{room_name}")

	@sync_to_async
	def is_user_online(self, user_id):
		online_users = redis_client.smembers("online_users")
		return str(user_id).encode() in online_users

	async def notify_friends_user_online(self, user_id):
		friends_ids = await self.get_user_friends(user_id)
		for friend_id in friends_ids:
			friend_channel_names = await self.get_channel_names(friend_id)
			for channel_name in friend_channel_names:
				await self.channel_layer.send(
					channel_name,
					{
						"type": "user_online",
						"user_id": user_id
					}
				)

	async def notify_friends_user_offline(self, user_id):
		friends_ids = await self.get_user_friends(user_id)
		for friend_id in friends_ids:
			friend_channel_names = await self.get_channel_names(friend_id)
			for channel_name in friend_channel_names:
				await self.channel_layer.send(
					channel_name,
					{
						"type": "user_offline",
						"user_id": user_id
					}
				)
	
	async def notify_new_chat(self, event):
		sender_info = event['sender_info']

		await self.send(text_data=json.dumps({
			"action": "notify_new_chat",
			"sender": sender_info
		}))

	
	async def user_online(self, event):
		user_id = event['user_id']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json.dumps({
			'action': 'update_friends_status',
			'user_id': user_id,
			'status': 'ONLINE',
		}))
	
	async def user_offline(self, event):
		user_id = event['user_id']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json.dumps({
			'action': 'update_friends_status',
			'user_id': user_id,
			'status': 'OFFLINE',
		}))
