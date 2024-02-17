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
    dummy_user2 = Members.objects.create(nickname = 'dummy2', email = 'dummy@test.com', is_2fa = False)
    dummy_user3 = Members.objects.create(nickname = 'dummy3', email = 'dummy@test.com', is_2fa = False)
    
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


#-------------------------------------------------------------------------------

#게임방 초대 및 입장 성공 테스트
@pytest.mark.asyncio
async def test_invite_and_join_room_success():

    channel_layer = get_channel_layer()

    # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
    fake_user = Members.objects.create(nickname = 'test', email = 'testUser@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)


    #더미 데이터 입력 
    dummy_user1 = Members.objects.create(nickname = 'dummy1', email = 'dummy@test.com', is_2fa = False)
    dummy_user2 = Members.objects.create(nickname = 'dummy2', email = 'dummy@test.com', is_2fa = False)
    
    invite_user = Members.objects.create(nickname = 'invite', email = 'invite@test.com', is_2fa = False)
    invite_refresh = RefreshToken.for_user(invite_user)
    invite_token = str(invite_refresh.access_token)

    invite_time = datetime(2024, 2, 13, 12, 0, 0)
    iso_8601_invite_time = invite_time.isoformat()
    
    accept_time = datetime(2024, 2, 13, 12, 0, 30)
    iso_8601_accept_time = accept_time.isoformat()


    tournament = Tournament.objects.create()

    value = {
        "registered_user": [
            { "user_id" : dummy_user1.id, "channel_id": "123"},
            { "user_id" : dummy_user2.id, "channel_id": "123"},
            { "user_id" : fake_user.id, "channel_id": "123"}],
        "invited_info": [],
        "join_user": [ dummy_user1.id, dummy_user2.id ]
    }

    cache.set('tournament_' + str(tournament.id), json.dumps(value))


    #fake user가 발급 받은 게임방 아이디로 접속
    join_communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
    join_connected, join_subprotocol = await join_communicator.connect()

    assert join_connected

    await join_communicator.send_json_to({
        "action": "join_room",
        "user_id": fake_user.id
    })

    #fake_user가 invite_user를 초대
    await join_communicator.send_json_to({
        "action": "invite_room",
        "user_id": fake_user.id,
        "invite_user_id": invite_user.id,
        "invite_time": iso_8601_invite_time
    })

    join_response = await join_communicator.receive_json_from()    
    
    #fake_user가 초대해서 reponse 받은 room id로 invite_user가 토너먼트 초대 수락
    invite_queue_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + invite_token)
    invite_queue_connected, invite_subprotocol = await invite_queue_communicator.connect()

    assert invite_queue_connected

    await invite_queue_communicator.send_json_to({
        "action": "join_invite_tournament_queue",
        "tournament_id": join_response["tournament_id"],
        "accept_time": iso_8601_accept_time,
        "user_id": invite_user.id
    })

    invite_queue_response = await invite_queue_communicator.receive_json_from() 

    assert invite_queue_response['status'] == "success"
    
    await invite_queue_communicator.disconnect()


    #초대 수락에 성공한 invite_user가 게임방 아이디로 접속
    invite_communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + invite_token)
    invite_connected, invite_subprotocol = await invite_communicator.connect()

    assert invite_connected

    await invite_communicator.send_json_to({
        "action": "join_room",
        "user_id": invite_user.id
    })

    invite_response = await invite_communicator.receive_json_from()    

    assert invite_response["status"] == "game_start_soon"

    await invite_communicator.disconnect()
    await join_communicator.disconnect()
