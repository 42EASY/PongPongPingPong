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
from tournaments.models import Tournament
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
from django.core.cache import cache

async def mock_authenticate(scope, user):
    scope['user'] = user
    return scope


#초대를 받는 경우 성공 테스트
@pytest.mark.asyncio
async def test_invited_normal_queue_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_a', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

        test_user = Members.objects.create(nickname = 'aa', email = 'tt@test.com', is_2fa = False)
        value = {
            "registered_user": [{
                "user_id" : test_user.id,
                "channel_id": "123"
            }],
            "invited_info": [{
                "user_id": fake_user.id
            }]
        }

        cache.set('normal_' + str(fake_game.id),  json.dumps(value))

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": fake_game.id
        })

        response = await communicator.receive_json_from()    

        assert response["status"] == "game_start_soon"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        fake_game.delete()
        test_user.delete()
         

#redis에 key가 없는 경우
@pytest.mark.asyncio
async def test_invited_normal_queue_fail_no_value():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_b', email = 'testUser1@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

        test_user = Members.objects.create(nickname = 'bb', email = 'tt@test.com', is_2fa = False)
        value = {
            "registered_user": [{
                "user_id" : test_user.id,
                "channel_id": "123"
            }],
            "invited_info": [{
                "user_id": fake_user.id
            }]
        }

        #redis에 normal_를 뺀 유효하지 않는 값을 key로하여 저장
        cache.set(str(fake_game.id),  json.dumps(value))

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": fake_game.id
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "잘못된 game_id 입니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        fake_game.delete()
        test_user.delete()         


#초대리스트에 아무도 없는 경우
@pytest.mark.asyncio
async def test_invited_normal_queue_fail_no_invited_info():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_c', email = 'testUser1@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

        test_user = Members.objects.create(nickname = 'cc', email = 'tt@test.com', is_2fa = False)
    
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
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": fake_game.id
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "초대 내역이 없습니다"

        await communicator.disconnect()
    
    finally:
        fake_user.delete()
        fake_game.delete()
        test_user.delete()
         
    

#초대리스트에 user_id가 없는 경우
@pytest.mark.asyncio
async def test_invited_normal_queue_fail_invited_info_no_user_id():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_d', email = 'testUser1@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_game = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

        test_user = Members.objects.create(nickname = 'dd', email = 'tt@test.com', is_2fa = False)

        tmp_user = Members.objects.create(nickname = 'tmp_d', email = "tmp@test.com", is_2fa = False)

        #초대리스트에 fake_user의 id 대신 다른 id 값 저장
        value = {
            "registered_user": [{
                "user_id" : test_user.id,
                "channel_id": "123"
            }],
            "invited_info": [{
                "user_id": tmp_user.id,
            }]
        }

        cache.set('normal_' + str(fake_game.id),  json.dumps(value))

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": fake_game.id
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "초대 대상이 아닙니다"

        await communicator.disconnect()
    
    finally:
        fake_user.delete()
        fake_game.delete()
        test_user.delete()
        tmp_user.delete()
         


#잘못된 game_id 인 경우
@pytest.mark.asyncio
async def test_invited_normal_queue_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_e', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": -1
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "잘못된 game id 입니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()
         


#-------------------------------------------------------------------------------

#초대를 하는 경우 테스트코드
@pytest.mark.asyncio
async def test_invite_normal_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_f', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        test_user = Members.objects.create(nickname = 'ff', email = 'tt@test.com', is_2fa = False)
        test_refresh = RefreshToken.for_user(test_user)
        test_token = str(test_refresh.access_token)

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "invite_normal_queue",
            "game_mode": Game.GameOption.CLASSIC,
            "invite_user_id": test_user.id
        })

        response = await communicator.receive_json_from()    

        assert response["status"] == "game create success"

        test_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + test_token)
        test_communicator.scope = await mock_authenticate(test_communicator.scope, test_user)
        test_connected, test_subprotocol = await test_communicator.connect()

        assert test_connected

        await test_communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": response["game_id"]
        })

        response2 = await test_communicator.receive_json_from()    

        assert response2["status"] == "game_start_soon"

        await communicator.disconnect()
        await test_communicator.disconnect()

    finally:
        fake_user.delete()
        test_user.delete()




#invite_user_id가 잘못된 경우
@pytest.mark.asyncio
async def test_invite_normal_invalid_invite_user_id():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_g', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "invite_normal_queue",
            "game_mode": Game.GameOption.CLASSIC,
            "invite_user_id": -1
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "잘못된 invite user id 입니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()




#-------------------------------------------------------------------------------

#빠른 시작인 경우 테스트코드 - 방을 새로 만들어서 기다리는 경우
@pytest.mark.asyncio
async def test_join_normal_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_h', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

    
        test_user = Members.objects.create(nickname = 'hh', email = 'tt@test.com', is_2fa = False)
        test_refresh = RefreshToken.for_user(test_user)
        test_token = str(test_refresh.access_token)

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        test_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + test_token)
        test_communicator.scope = await mock_authenticate(test_communicator.scope, test_user)
        test_connected, test_subprotocol = await test_communicator.connect()

        assert test_connected

        await communicator.send_json_to({
            "action": "join_normal_queue",
            "game_mode": Game.GameOption.CLASSIC
        })

        await communicator.receive_json_from()

        await test_communicator.send_json_to({
            "action": "join_normal_queue",
            "game_mode": Game.GameOption.CLASSIC
        })


        response = await test_communicator.receive_json_from()    

        assert response["status"] == "game_start_soon"
    
        await communicator.disconnect()
        await test_communicator.disconnect()

    finally:
        fake_user.delete()
        test_user.delete()




#-------------------------------------------------------------------------------
    
#토너먼트에서 초대를 받는 경우 성공
@pytest.mark.asyncio
async def test_invited_tournament_queue_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_i', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_tournament = Tournament.objects.create()

        test_user = Members.objects.create(nickname = 'tt_i', email = 'tt@test.com', is_2fa = False)
    
        value = {
            "registered_user": [{
                "user_id" : test_user.id,
                "channel_id": "123"
            }],
            "invited_info": [{
                "user_id": fake_user.id
            }]
        }

        cache.set('tournament_' + str(fake_tournament.id),  json.dumps(value))

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_tournament_queue",
            "room_id": fake_tournament.id
        })

        response = await communicator.receive_json_from()    

        assert response["status"] == "success"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        fake_tournament.delete()
        test_user.delete()



#redis에 key가 없는 경우
@pytest.mark.asyncio
async def test_invited_tournament_queue_fail_no_value():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_j', email = 'testUser1@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_tournament = Tournament.objects.create()

        test_user = Members.objects.create(nickname = 'tt_j', email = 'tt@test.com', is_2fa = False)
    
        value = {
            "registered_user": [{
                "user_id" : test_user.id,
                "channel_id": "123"
            }],
            "invited_info": [{
                "user_id": fake_user.id
            }]
        }

        #redis에 tournament_를 뺀 유효하지 않는 값을 key로하여 저장
        cache.set(str(fake_tournament.id),  json.dumps(value))

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_tournament_queue",
            "room_id": fake_tournament.id
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "잘못된 room_id 입니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        fake_tournament.delete()
        test_user.delete()
    


#초대리스트에 아무도 없는 경우
@pytest.mark.asyncio
async def test_invited_tournament_queue_fail_no_invited_info():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_k', email = 'testUser1@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_tournament = Tournament.objects.create()

        test_user = Members.objects.create(nickname = 'tt_k', email = 'tt@test.com', is_2fa = False)
    
        #초대리스트에 아무것도 없도록 함
        value = {
            "registered_user": [{
                "user_id" : test_user.id,
                "channel_id": "123"
            }],
            "invited_info": []
        }

        cache.set('tournament_' + str(fake_tournament.id),  json.dumps(value))

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_tournament_queue",
            "room_id": fake_tournament.id
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "초대 내역이 없습니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        fake_tournament.delete()
        test_user.delete()



#초대리스트에 user_id가 없는 경우
@pytest.mark.asyncio
async def test_invited_tournament_queue_fail_invited_info_no_user_id():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_l', email = 'testUser1@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        fake_tournament = Tournament.objects.create()

        test_user = Members.objects.create(nickname = 'tt_l', email = 'tt@test.com', is_2fa = False)
        
        tmp_user = Members.objects.create(nickname = 'tmp_l', email = 'tmp@test.com', is_2fa = False)
        #초대리스트에 fake_user의 id 대신 다른 id 값 저장
        value = {
            "registered_user": [{
                "user_id" : test_user.id,
                "channel_id": "123"
            }],
            "invited_info": [{
                "user_id": tmp_user.id
            }]
        }

        cache.set('tournament_' + str(fake_tournament.id),  json.dumps(value))

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_tournament_queue",
            "room_id": fake_tournament.id
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "초대 대상이 아닙니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        fake_tournament.delete()
        test_user.delete()
        tmp_user.delete()

    



#잘못된 tournament_id 인 경우
@pytest.mark.asyncio
async def test_invited_tournament_queue_invalid_tournament_id():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_m', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

    
        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_invite_tournament_queue",
            "room_id": -1
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "잘못된 room_id 입니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()




#-------------------------------------------------------------------------------

#토너먼트 초대를 하는 경우 테스트코드
@pytest.mark.asyncio
async def test_invite_tournament_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_n', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        test_user = Members.objects.create(nickname = 'n', email = 'tt@test.com', is_2fa = False)
    
        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "invite_tournament_queue",
            "invite_user_id": test_user.id
        })

        response = await communicator.receive_json_from()    

        assert response["status"] == "game create success"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        test_user.delete()




#잘못된 invite_user_id 인 경우
@pytest.mark.asyncio
async def test_invite_tournament_invalid_invite_user_id():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_o', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "invite_tournament_queue",
            "invite_user_id": -1
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "잘못된 invite user id 입니다"

        await communicator.disconnect()

    finally:
        fake_user.delete()



#-------------------------------------------------------------------------------

#토너먼트 빠른 시작인 경우 테스트코드
@pytest.mark.asyncio
async def test_join_tournament_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_p', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

    
        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_tournament_queue"
        })


        response = await communicator.receive_json_from()    

        assert response["status"] == "success"
    
        await communicator.disconnect()

    finally:
        fake_user.delete()


#-------------------------------------------------------------------------------

#잘못된 action일 때
@pytest.mark.asyncio
async def test_invalid_action():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_q', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

     #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "invalid"
        })

        response = await communicator.receive_json_from()    

        assert response["message"] == "잘못된 action 입니다"
    
        await communicator.disconnect()

    finally:
        fake_user.delete()

#-------------------------------------------------------------------------------

#normal에서 초대를 하고 disconnect 테스트코드
@pytest.mark.asyncio
async def test_invite_normal_disconnect():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_r', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        test_user = Members.objects.create(nickname = 'rr', email = 'tt@test.com', is_2fa = False)
        test_refresh = RefreshToken.for_user(test_user)
        test_token = str(test_refresh.access_token)

        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "invite_normal_queue",
            "game_mode": Game.GameOption.CLASSIC,
            "invite_user_id": test_user.id
        })

        response = await communicator.receive_json_from()    

        assert response["status"] == "game create success"

        #초대 후에 disconnect
        await communicator.disconnect()

        test_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + test_token)
        test_communicator.scope = await mock_authenticate(test_communicator.scope, test_user)
        test_connected, test_subprotocol = await test_communicator.connect()

        assert test_connected

        await test_communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": response["game_id"]
        })

        response2 = await test_communicator.receive_json_from()    

        assert response2["status"] == "fail"
        assert response2["message"] == "존재하지 않는 게임입니다"


        await test_communicator.disconnect()

    finally:
        fake_user.delete()
        test_user.delete()



#토너먼트 초대 후 disconnect
@pytest.mark.asyncio
async def test_invite_tournament_disconnect():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_q', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        test_user = Members.objects.create(nickname = 'qq', email = 'tt@test.com', is_2fa = False)
        test_refresh = RefreshToken.for_user(test_user)
        test_token = str(test_refresh.access_token)
    
        #토큰과 함께 ws/join_queue 에 연결
        communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "invite_tournament_queue",
            "invite_user_id": test_user.id
        })

        response = await communicator.receive_json_from()    

        assert response["status"] == "game create success"

        await communicator.disconnect()

        
        test_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + test_token)
        test_communicator.scope = await mock_authenticate(test_communicator.scope, test_user)
        test_connected, subprotocol = await test_communicator.connect()

        assert test_connected

        await test_communicator.send_json_to({
            "action": "join_invite_tournament_queue",
            "room_id": response["room_id"]
        })
        
        response2 = await test_communicator.receive_json_from()    

        assert response2["status"] == "fail"
        assert response2["message"] == "존재하지 않는 게임입니다"


        await test_communicator.disconnect()


    finally:
        fake_user.delete()
        test_user.delete()