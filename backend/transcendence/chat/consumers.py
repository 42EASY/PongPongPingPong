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

class BaseConsumer(AsyncWebsocketConsumer):
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
	
	async def update_friends_status(self, event):
		# event에서 사용자 상태 정보를 추출
		text_data_json = json.loads(event['text'])

		user_id = text_data_json['user_id']
		status = text_data_json['status']

		# 클라이언트에게 상태 변경 알림을 전송
		await self.send(text_data=json.dumps({
			'action': 'update_friends_status',
			'user_id': user_id,
			'status': status,
		}))

def create_room_name(user_id, target_user_id):
	sorted_ids = sorted([int(user_id), int(target_user_id)])
	
	room_name = f"{sorted_ids[0]}_{sorted_ids[1]}"
	
	return room_name
	
class ChatConsumer(BaseConsumer):
	async def connect(self):
		await super().connect()
		self.target_user_id = self.scope['url_route']['kwargs']['target_user_id']
		user_id = self.scope['user'].id

		if await self.is_user_online(self.target_user_id):
			room_name = create_room_name(user_id, self.target_user_id)
			self.room_name = room_name
			self.room_group_name = f'chat_{self.room_name}'

			# 비동기 함수를 직접 호출
			room_exists = await self.chat_room_exists(self.room_name)
			
			if not room_exists:
				room_data = {
					"created_at": str(datetime.now()),
					"participants": [user_id, self.target_user_id]
				}
				await self.save_chat_room_to_redis(self.room_name, room_data)

			# 채팅방에 연결
			await self.channel_layer.group_add(
				self.room_group_name,
				self.channel_name
			)
		else:
			await self.send(text_data=json.dumps({
				'status' : 'join_chat_failed'
			}))

	async def disconnect(self, close_code):
		# 채팅방 그룹에서 사용자를 제거
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

		await self.delete_chat_room_to_redis(self.room_name)

		await super().disconnect(close_code)

	async def receive(self, text_data):
		# 메시지를 JSON 형태로 파싱
		text_data_json = json.loads(text_data)
		
		await self.handle_chat(text_data_json)

	async def handle_chat(self, data):
		action = data['action']
		if action == 'join_chat':
			self.join_chat()
		elif action == 'send_message':
			message = data['message']
			room_name = data['room_name']
			if room_name == self.room_group_name:
				await self.send_message(self.target_user_id, message)
		elif action == 'invite_normal_game':
			invitee_id = self.target_user_id
			option = data['option']
			room_name = data['room_name']
			if room_name == self.room_group_name:
				await self.invite_normal_game(invitee_id, option)
		elif action == 'invite_tournament_game':
			invitee_id = self.target_user_id
			room_name = data['room_name']
			if room_name == self.room_group_name:
				await self.invite_tournament_game(invitee_id)


	@sync_to_async
	def chat_room_exists(self, room_name):
		# Redis에서 채팅방 키의 존재 여부를 확인
		return redis_client.exists(f'chat_room:{room_name}')

	@sync_to_async
	def save_chat_room_to_redis(self, room_name, room_data):
		# room_data는 딕셔너리 형태이며, JSON 문자열로 변환하여 저장
		redis_client.set(f"chat_room:{room_name}", json.dumps(room_data))

	@sync_to_async
	def delete_chat_room_to_redis(self, room_name):
		redis_client.delete(f"chat_room:{room_name}")

	async def join_chat(self):
		await self.send(text_data=json.dumps({
			'status' : 'join_chat_success',
			'room_group_name' : self.room_group_name
		}))

	async def send_message(self, target_user_id, message):
		 # 현재 시간을 UTC로 기록
		timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

		message_data = {
			'message': message,
			'timestamp': timestamp,
			'sender_id': self.user.id,
		}

		# 수신자의 channel_name 조회
		receiver_channel_name = await self.get_channel_name(target_user_id)

		if receiver_channel_name:
			# 수신자의 채널에 메시지 전송
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'chat_message',
					'text': json.dumps(message_data),
				}
			)

	async def chat_message(self, event):
		text_data_json = json.loads(event['text'])
		message = text_data_json['message']
		timestamp = text_data_json['timestamp']
		sender_id = text_data_json['sender_id']

		if sender_id != self.user.id:
			# 파싱된 메시지 데이터를 클라이언트에게 전송
			await self.send(text_data=json.dumps({
				'action' : 'receive_message',
				'room_name' : self.room_group_name,
				'message': message,
				'timestamp': timestamp,
				'sender_id': sender_id,
			}))

	async def invite_normal_game(self, invitee_id, game_option):
		 # 현재 시간을 UTC로 기록
		timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

		# TODO: 게임 정보 받아오기 ..
		game = {
			'game_id' : 1,
			'option' : game_option
		}

		message_data = {
			'game': game,
			'room_name' : self.room_group_name,
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
	
	async def notice_invite_normal_game(self, event):
		text_data_json = json.loads(event['text'])

		game = text_data_json['game']
		inviter_id = text_data_json['inviter_id']
		timestamp = text_data_json['timestamp']

		await self.send(text_data=json.dumps({
			'action' : 'invited_normal_game',
			'game' : game,
			'room_name' : self.room_group_name,
			'inviter_id' : inviter_id,
			'timestamp' : timestamp,
		}))
	
	async def invite_tournament_game(self, invitee_id):
		 # 현재 시간을 UTC로 기록
		timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

		# TODO: 토너먼트 로직 추가 (게임방 만들기 등...)
		# tournament id를 줄지? 아니면.. room_id? (게임 대기방)을 줄지..

		message_data = {
			'tournament_id': 1,
			'inviter_id' : self.user.id,
			'room_name' : self.room_group_name,
			'timestamp': timestamp,
		}

		invitee_channel_name = await self.get_channel_name(invitee_id)

		if invitee_channel_name:
			# 수신자에게 메시지 전송
			await self.channel_layer.send(
				invitee_channel_name,
				{
					'type': 'notice_invite_tournament_game',
					'text': json.dumps(message_data),
				}
			)

	async def notice_invite_tournament_game(self, event):
		text_data_json = json.loads(event['text'])

		tournament_id = text_data_json['tournament_id']
		inviter_id = text_data_json['inviter_id']
		timestamp = text_data_json['timestamp']

		await self.send(text_data=json.dumps({
			'action' : 'invited_tournament_game',
			'tournament_id' : tournament_id,
			'room_name' : self.room_group_name,
			'inviter_id' : inviter_id,
			'timestamp' : timestamp,
		}))
