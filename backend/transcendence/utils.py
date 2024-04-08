from datetime import datetime, timezone
from members.models import Members
from social.models import Block
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import json
import redis

redis_client = redis.Redis(host='redis', port=6379, db=0)

def json_encode(data):
	try:
		return json.dumps(data, ensure_ascii=False)
	except (TypeError, ValueError) as e:
		print(f"JSON encoding error: {e}")
		return None

def parse_timestamp_to_float(timestamp_str):
	try:
		# UTC Z 제거
		timestamp_str = timestamp_str[:-1]
		dt = datetime.fromisoformat(timestamp_str)
		return dt.timestamp()
	except ValueError as e:
		print(f"Timestamp parsing error: {e}")
		return None

def get_timestamp():
    # 현재 UTC 시간을 얻고, ISO 8601 형식으로 변환
    now = datetime.now(timezone.utc)
    iso_string = now.isoformat()
    return iso_string

async def bot_send_notify(self, user_id):
	channel_names = await get_notify_channel_names(user_id)

	for channel_name in channel_names:
		await self.channel_layer.send(
			channel_name,
			{
				"type": "bot_notify",
				"user_id": user_id,
			}
		)

async def bot_chat_send(self, user_id, data):
	channel_names = await get_chat_channel_names(user_id)

	for channel_name in channel_names:
		await self.channel_layer.send(
			channel_name,
			{
				"type": "bot_chat",
				"data": data,
			}
		)
  
async def make_bot_notify_message(action, data):
	return {
		"action": action,
		**data,
		"timestamp": get_timestamp(),
	}

# bot redis에 메세지 저장
async def save_bot_notify(user_id, data):
	redis_client.rpush(f"bot_notify_messages:{user_id}", json_encode(data))

async def notify_chat_send(self, receiver_id, sender_info):
	receiver_channel_names = await get_notify_channel_names(receiver_id)

	for channel_name in receiver_channel_names:
		await self.channel_layer.send(
				channel_name,
				{
					"type": "notify_new_chat",
					"sender_info": sender_info,
				}
			)

async def bot_notify_process(self, user_id, action, data):
	message = await make_bot_notify_message(action, data)
	await save_bot_notify(user_id, message)
	await bot_send_notify(self, user_id)
	await bot_chat_send(self, user_id, message)

@sync_to_async
def is_user_online(user_id):
	return redis_client.sismember("online_users", user_id)

@database_sync_to_async
def is_user_blocked(user_id, partner_id):
	return Block.objects.filter(user_id=user_id, target_id=partner_id).exists()

@database_sync_to_async
def get_user_online_status(partner_id):
	return Members.objects.filter(id=partner_id, status=Members.Status.ONLINE).exists()

@database_sync_to_async
def get_member_info(user_id):
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
def get_notify_channel_names(user_id):
	notify_channel_names_bytes = redis_client.smembers(f"user_notify_channels_{user_id}")
	notify_channel_names = {name.decode('utf-8') for name in notify_channel_names_bytes}
	return notify_channel_names

@sync_to_async
def get_chat_channel_names(user_id):
	chat_channel_names_bytes = redis_client.smembers(f"user_chat_channels_{user_id}")
	chat_channel_names = {name.decode('utf-8') for name in chat_channel_names_bytes}
	return chat_channel_names

