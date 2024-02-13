import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
django.setup()

import pytest
from channels.testing import WebsocketCommunicator
from .game_queue_consumer import GameQueueConsumer
from channels.layers import get_channel_layer
import json
from members.models import Members
from games.models import Game
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
from django.core.cache import cache

@pytest.mark.asyncio
async def test_invite_normal_queue_success():

    channel_layer = get_channel_layer()

    #테스트용 토큰 발급
    fake_user = Members.objects.create(nickname = 'test_user', email = 'testUser@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

    accept_time = datetime(2024, 2, 13, 12, 0, 0)
    invite_time = datetime(2024, 2, 13, 12, 0, 42)

    iso_8601_accept_time = accept_time.isoformat()
    iso_8601_invite_time = invite_time.isoformat()

    test_user = Members.objects.create(nickname = 'tt', email = 'tt@test.com', is_2fa = False)
    value = {
        "registered_user": [{
            "user_id" : test_user.id,
            "channel_id": 123
        }],
        "invited_info": [{
            "user_id": fake_user.id,
            "invited_time": iso_8601_invite_time
        }]
    }

    cache.set('normal_' + str(fake_game.id),  json.dumps(value))

    #토큰과 함께 ws/join_queue 에 연결
    communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
    connected, subprotocol = await communicator.connect()

    assert connected

    await communicator.send_json_to({
        "action": "join_invite_normal_queue",
        "game_id": fake_game.id,
        "accept_time": iso_8601_accept_time,
        "user_id": fake_user.id
    })

    response = await communicator.receive_json_from()    

    assert response["status"] == "game_start_soon"

    await communicator.disconnect()
         
