import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
django.setup()

import pytest
from channels.testing import WebsocketCommunicator
from .game_queue_consumer import GameQueueConsumer
from .game_room_consumer import GameRoomConsumer
from channels.layers import get_channel_layer
import json
from members.models import Members
from tournaments.models import Tournament
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

#게임방 4명 입장 성공 테스트
@pytest.mark.asyncio
async def test_join_room_success():

    channel_layer = get_channel_layer()

    # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
    fake_user = Members.objects.create(nickname = 'test', email = 'testUser@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)


    #더미 데이터 입력 
    dummy_user1 = Members.objects.create(nickname = 'dummy1', email = 'dummy@test.com', is_2fa = False)
    dummy_user2 = Members.objects.create(nickname = 'dummy1', email = 'dummy@test.com', is_2fa = False)
    dummy_user3 = Members.objects.create(nickname = 'dummy1', email = 'dummy@test.com', is_2fa = False)
    
    tournament = Tournament.objects.create()

    value = {
        "registered_user": [
            { "user_id" : dummy_user1.id, "channel_id": "123"},
            { "user_id" : dummy_user2.id, "channel_id": "123"},
            { "user_id" : dummy_user3.id, "channel_id": "123"},
            { "user_id" : fake_user.id, "channel_id": "123"}],
        "invited_info": [],
        "join_user": [ dummy_user1.id, dummy_user2.id, dummy_user3.id ]
    }

    cache.set('tournament_' + str(tournament.id), json.dumps(value))


    #발급 받은 게임방 아이디로 접속
    communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
    connected, subprotocol = await communicator.connect()

    assert connected

    await communicator.send_json_to({
        "action": "join_room",
        "user_id": fake_user.id
    })

    response = await communicator.receive_json_from()    

    assert response["status"] == "game_start_soon"

    await communicator.disconnect()
