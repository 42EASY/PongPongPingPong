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

    # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
    fake_user = Members.objects.create(nickname = 'test_user', email = 'testUser@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

    invite_time = datetime(2024, 2, 13, 12, 0, 0)
    accept_time = datetime(2024, 2, 13, 12, 0, 42)

    iso_8601_accept_time = accept_time.isoformat()
    iso_8601_invite_time = invite_time.isoformat()

    test_user = Members.objects.create(nickname = 'tt', email = 'tt@test.com', is_2fa = False)
    value = {
        "registered_user": [{
            "user_id" : test_user.id,
            "channel_id": "123"
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
         

#redis에 key가 없는 경우
@pytest.mark.asyncio
async def test_invite_normal_queue_fail_no_value():

    channel_layer = get_channel_layer()

    # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
    fake_user = Members.objects.create(nickname = 'test_user1', email = 'testUser1@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

    invite_time = datetime(2024, 2, 13, 12, 0, 0)
    accept_time = datetime(2024, 2, 13, 12, 0, 42)

    iso_8601_accept_time = accept_time.isoformat()
    iso_8601_invite_time = invite_time.isoformat()

    test_user = Members.objects.create(nickname = 'tt1', email = 'tt@test.com', is_2fa = False)
    value = {
        "registered_user": [{
            "user_id" : test_user.id,
            "channel_id": "123"
        }],
        "invited_info": [{
            "user_id": fake_user.id,
            "invited_time": iso_8601_invite_time
        }]
    }

    #redis에 normal_를 뺀 유효하지 않는 값을 key로하여 저장
    cache.set(str(fake_game.id),  json.dumps(value))

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

    assert response["message"] == "잘못된 game_id 입니다"

    await communicator.disconnect()
         


#초대리스트에 아무도 없는 경우
@pytest.mark.asyncio
async def test_invite_normal_queue_fail_no_invited_info():

    channel_layer = get_channel_layer()

    # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
    fake_user = Members.objects.create(nickname = 'test_user2', email = 'testUser1@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

    invite_time = datetime(2024, 2, 13, 12, 0, 0)
    accept_time = datetime(2024, 2, 13, 12, 0, 42)

    iso_8601_accept_time = accept_time.isoformat()
    iso_8601_invite_time = invite_time.isoformat()

    test_user = Members.objects.create(nickname = 'tt2', email = 'tt@test.com', is_2fa = False)
    
    #초대리스트에 아무것도 없도록 함
    value = {
        "registered_user": [{
            "user_id" : test_user.id,
            "channel_id": "123"
        }],
        "invited_info": []
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

    assert response["message"] == "초대 내역이 없습니다"

    await communicator.disconnect()
         
    

#초대리스트에 user_id가 없는 경우
@pytest.mark.asyncio
async def test_invite_normal_queue_fail_invitied_info_no_user_id():

    channel_layer = get_channel_layer()

    # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
    fake_user = Members.objects.create(nickname = 'test_user3', email = 'testUser1@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

    invite_time = datetime(2024, 2, 13, 12, 0, 0)
    accept_time = datetime(2024, 2, 13, 12, 0, 42)

    iso_8601_accept_time = accept_time.isoformat()
    iso_8601_invite_time = invite_time.isoformat()

    test_user = Members.objects.create(nickname = 'tt3', email = 'tt@test.com', is_2fa = False)
    #초대리스트에 fake_user의 id 대신 유효하지 않은 id 값 저장
    value = {
        "registered_user": [{
            "user_id" : test_user.id,
            "channel_id": "123"
        }],
        "invited_info": [{
            "user_id": -1,
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

    assert response["message"] == "초대 대상이 아닙니다"

    await communicator.disconnect()
         

#유효한 초대시간이 아닌 경우
@pytest.mark.asyncio
async def test_invite_normal_queue_fail_invalid_time():

    channel_layer = get_channel_layer()

    # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
    fake_user = Members.objects.create(nickname = 'test_user3', email = 'testUser1@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

    invite_time = datetime(2024, 2, 13, 12, 0, 0)
    #유효하지 않는 초대시간으로 변경
    accept_time = datetime(2024, 2, 13, 12, 1, 42)

    iso_8601_accept_time = accept_time.isoformat()
    iso_8601_invite_time = invite_time.isoformat()

    test_user = Members.objects.create(nickname = 'tt3', email = 'tt@test.com', is_2fa = False)
    value = {
        "registered_user": [{
            "user_id" : test_user.id,
            "channel_id": "123"
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

    assert response["message"] == "초대 가능 시간이 초과되었습니다"

    await communicator.disconnect()
    