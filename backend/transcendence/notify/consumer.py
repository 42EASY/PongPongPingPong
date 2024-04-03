from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from social.models import Friend
from members.models import Members
from social.models import Block
import json
import redis

redis_client = redis.Redis(host='redis', port=6379, db=0)

def json_encode(data):
	try:
		return json.dumps(data, ensure_ascii=False)
	except (TypeError, ValueError) as e:
		print(f"JSON encoding error: {e}")
		return None

class NotifyConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope["user"]
		await self.accept()

		user_id = self.user.id

		await self.add_channel_name(user_id, self.channel_name)
		# 사용자를 온라인으로 표시하는 로직
		await self.mark_user_online(user_id)
		# 채팅 상대방들 상태 확인
		await self.fetch_and_notify_chat_partners_status(user_id)
		# 채팅 상대방에게 온라인 상태 알림
		await self.notify_chat_partners_user_online(user_id)

	async def disconnect(self, close_code):
		user_id = self.user.id
		await self.remove_channel_name(user_id, self.channel_name)

		channel_set_size = await self.get_channel_set_size(user_id)

		if channel_set_size == 0:
			# 사용자를 오프라인으로 표시하는 로직
			await self.mark_user_offline(user_id)
			# 오프라인임을 채팅 파트너에게 알림
			await self.notify_chat_partners_user_offline(user_id)
	
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
		Members.objects.filter(id=user_id).update(status=Members.Status.ONLINE)
		redis_client.sadd("online_users", user_id)

	@sync_to_async
	def mark_user_offline(self, user_id):
		# Redis를 이용해 사용자를 오프라인으로 표시
		Members.objects.filter(id=user_id).update(status=Members.Status.OFFLINE)
		redis_client.srem("online_users", user_id)

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
		return redis_client.sismember("online_users", user_id)

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
		await self.send(text_data=json_encode({
			"action": "notify_new_chat",
			"sender": sender_info
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

	@sync_to_async
	def get_partner_user_ids(self, user_id, chat_list):
		partner_ids = set()
		for chat_name in chat_list:
			_, user_id_str, partner_id_str = chat_name.split('_')
			partner_id = user_id_str if user_id_str != str(user_id) else partner_id_str
			partner_ids.add(int(partner_id))
		return list(partner_ids)

	@database_sync_to_async
	def is_user_blocked(self, user_id, partner_id):
		return Block.objects.filter(user_id=user_id, target_id=partner_id).exists()

	@database_sync_to_async
	def get_user_online_status(self, partner_id):
		return Members.objects.filter(id=partner_id, status=Members.Status.ONLINE).exists()

	async def fetch_and_notify_chat_partners_status(self, user_id):
		chat_list = await self.get_chat_list(user_id)
		partner_ids = await self.get_partner_user_ids(user_id, chat_list)

		for partner_id in partner_ids:
			is_online = await self.get_user_online_status(partner_id)
			is_blocked = await self.is_user_blocked(user_id, partner_id)

			# 클라이언트에게 상태 정보 전송
			await self.send(text_data=json_encode({
				"action": "notify_chat_partner_status",
				"partner_id": partner_id,
				"is_online": is_online,
				"is_blocked": is_blocked,
			}))

	async def notify_chat_partners_user_online(self, user_id):
		# 사용자 채팅룸 가져오기
		user_chat_rooms = await self.get_chat_list(user_id)
		
		# 각 채팅방에 대해
		for room_name in user_chat_rooms:
			_, other_user_id = room_name.split('_')[1:]  # A와 B 중 나머지 하나
			other_user_id = int(other_user_id) if other_user_id != str(user_id) else int(_)
			
			# 상대방 사용자의 채널 이름들을 가져온다
			other_user_channels = await self.get_channel_names(other_user_id)
			
			# 각 채널에 오프라인 상태 알림을 전송한다
			for channel_name in other_user_channels:
				await self.channel_layer.send(
					channel_name,
					{
						"type": "user_online",
						"user_id": user_id,
					}
				)

	async def notify_chat_partners_user_offline(self, user_id):
		# 사용자 채팅룸 가져오기
		user_chat_rooms = await self.get_chat_list(user_id)
		
		# 각 채팅방에 대해
		for room_name in user_chat_rooms:
			_, other_user_id = room_name.split('_')[1:]  # A와 B 중 나머지 하나
			other_user_id = int(other_user_id) if other_user_id != str(user_id) else int(_)
			
			# 상대방 사용자의 채널 이름들을 가져온다
			other_user_channels = await self.get_channel_names(other_user_id)
			
			# 각 채널에 오프라인 상태 알림을 전송한다
			for channel_name in other_user_channels:
				await self.channel_layer.send(
					channel_name,
					{
						"type": "user_offline",
						"user_id": user_id,
					}
				)

	async def receive_message(self, event):
		message_data = event['message_data']

		await self.send(text_data=json_encode({
			"action": "receive_message",
			**message_data,
		}))
