# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from datetime import datetime
from django.conf import settings
from social.models import Friend
from members.models import Members
import json
import redis

# Redis 클라이언트 설정
redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0)

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope["user"]
		await self.accept()
		# 사용자를 온라인으로 표시
		await self.mark_user_online(self.user.id)
		await self.broadcast_user_status(self.user.id, "online")
		# 사용자의 channel name을 redis 에 저장
		await self.save_channel_name(self.user.id, self.channel_name)

	async def disconnect(self, close_code):
		# 사용자를 오프라인으로 표시
		await self.mark_user_offline(self.user.id)
		await self.broadcast_user_status(self.user.id, "offline")
		await self.delete_channel_name(self.user.id)

	async def receive(self, text_data):
		data = json.loads(text_data)
		action = data.get('action')

		if action == 'chat':
			await self.handle_chat(data)
		elif action == 'user_status':
			await self.update_friends_status(data)
		elif action == 'notice':
			await self.handle_notice(data)

	async def handle_chat(self, data):
		message = data['message']
		receiver_id = data['receiver_id']
		if await self.is_user_online(receiver_id):
			await self.send_message(receiver_id, message)
	
	async def handle_notice(self, data):
		type = data['type']
		invitee_id = data['invitee_id']
		game_option = data['game_option']

		if await self.is_user_online(invitee_id):
			if type == 'invite_normal_game':
				await self.invite_normal_game(invitee_id, game_option)

	@sync_to_async
	def save_channel_name(self, user_id, channel_name):
		redis_client.set(f"user_channel_{user_id}", channel_name)

	@sync_to_async
	def delete_channel_name(self, user_id):
		redis_client.delete(f"user_channel_{user_id}")

	@sync_to_async
	def mark_user_online(self, user_id):
		redis_client.sadd("online_users", user_id)

	@sync_to_async
	def mark_user_offline(self, user_id):
		redis_client.srem("online_users", user_id)

	@sync_to_async
	def is_user_online(self, user_id):
		return redis_client.sismember("online_users", user_id)

	@database_sync_to_async
	def get_user_friends(self, user_id):
		friends = Friend.objects.filter(target=user_id).values_list('user', flat=True)
		return Members.objects.filter(id__in=friends)

	@sync_to_async
	def get_channel_name(self, user_id):
		channel_name = redis_client.get(f"user_channel_{user_id}")
		if channel_name is not None:
			return channel_name.decode('utf-8')
		return None

	async def broadcast_user_status(self, user_id, status):
		friends = await self.get_user_friends(user_id)
		for friend in friends:
			if await self.is_user_online(friend.id):
				friend_channel_name = await self.get_channel_name(friend.id)
				if friend_channel_name:
					await self.channel_layer.send(
						friend_channel_name,
						{
							"type": "update_friends_status",
							"text" : json.dumps({
								"user_id": user_id,
								"status": status
							})
						}
					)

	async def chat_message(self, event):
		text_data_json = json.loads(event['text'])
		message = text_data_json['message']
		timestamp = text_data_json['timestamp']
		sender_id = text_data_json['sender_id']

		# 파싱된 메시지 데이터를 클라이언트에게 전송
		await self.send(text_data=json.dumps({
			'event' : 'receive_message',
			'message': message,
			'timestamp': timestamp,
			'sender_id': sender_id,
		}))
	
	async def send_message(self, user_id, message):
		 # 현재 시간을 UTC로 기록
		timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

		message_data = {
			'message': message,
			'timestamp': timestamp,
			'sender_id': self.user.id,
		}

		receiver_channel_name = await self.get_channel_name(user_id)

		if receiver_channel_name:
			# 수신자에게 메시지 전송
			await self.channel_layer.send(
				receiver_channel_name,
				{
					'type': 'chat_message',
					'text': json.dumps(message_data),
				}
			)

	async def update_friends_status(self, event):
		# event에서 사용자 상태 정보를 추출
		text_data_json = json.loads(event['text'])

		user_id = text_data_json['user_id']
		status = text_data_json['status']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json.dumps({
			'event': 'update_friends_status',
			'user_id': user_id,
			'status': status,
		}))

	async def notice_invite_normal_game(self, event):
		text_data_json = json.loads(event['text'])

		game = text_data_json['game']
		inviter_id = text_data_json['inviter_id']
		timestamp = text_data_json['timestamp']

		await self.send(text_data=json.dumps({
			'event' : 'notice_invite_normal_game',
			'game' : game,
			'inviter_id' : inviter_id,
			'timestamp' : timestamp,
		}))

	async def invite_normal_game(self, invitee_id, game_option):
		 # 현재 시간을 UTC로 기록
		timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

		# TODO: 게임 로직 추가 (게임방 만들기 등...)
		game = {
			'game_id' : 1,
			'option' : game_option
		}

		message_data = {
			'game': game,
			'inviter_id' : self.user.id,
			'timestamp': timestamp,
		}

		invitee_channel_name = await self.get_channel_name(invitee_id)

		if invitee_channel_name:
			# 수신자에게 메시지 전송
			await self.channel_layer.send(
				invitee_channel_name,
				{
					'type': 'notice_invite_normal_game',
					'text': json.dumps(message_data),
				}
			)
