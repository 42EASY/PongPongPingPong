import asyncio
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
django.setup()

import pytest
from channels.testing import WebsocketCommunicator
from .consumers import GameConsumer
from channels.layers import get_channel_layer
import json
from members.models import Members
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.asyncio
async def test_game_consumer():

    channel_layer = get_channel_layer()

    #테스트용 토큰 발급
    fake_user = Members.objects.create(nickname = 'test_user', email = 'testUser@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    #토큰과 함께 /ws/game/<int:room_id> 에 연결
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/42?token=" + fake_token)
    connected, subprotocol = await communicator.connect()

    assert connected

    #GameConsumer의 receive에 json send
    await communicator.send_json_to({
        "type": "game_message",
        "message": "Test Message"
    })

    response = await communicator.receive_json_from()    

    #GameConsumser에서 send한 값 테스트
    assert response == {
        'type': 'game_message',
        'message': 'hello'
    }

    await communicator.disconnect()
         
