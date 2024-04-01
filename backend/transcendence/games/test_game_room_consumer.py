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
from tournaments.models import Tournament, TournamentGame
from games.models import Participant, Game
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

async def mock_authenticate(scope, user):
    scope['user'] = user
    return scope

#게임방 4명 입장 성공 테스트
@pytest.mark.asyncio
async def test_join_room_success():
    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_1a', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)


        #더미 데이터 입력 
        dummy_user1 = Members.objects.create(nickname = 'dummy1_1a', email = 'dummy@test.com', is_2fa = False)
        dummy_user2 = Members.objects.create(nickname = 'dummy2_1a', email = 'dummy@test.com', is_2fa = False)
        dummy_user3 = Members.objects.create(nickname = 'dummy3_1a', email = 'dummy@test.com', is_2fa = False)
    
        tournament = Tournament.objects.create()

        value = {
            "registered_user": [
                { "user_id" : dummy_user1.id, "channel_id": "123"},
                { "user_id" : dummy_user2.id, "channel_id": "123"},
                { "user_id" : dummy_user3.id, "channel_id": "123"},
                { "user_id" : fake_user.id, "channel_id": "123"}],
            "invited_info": [],
            "join_user": [ dummy_user1.id, dummy_user2.id, dummy_user3.id ],
            "join_final_user": []
        }

        cache.set('tournament_' + str(tournament.id), json.dumps(value))


        #발급 받은 게임방 아이디로 접속
        communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_room"
        })

        response = await communicator.receive_json_from()    

        assert response["status"] == "game_start_soon"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        dummy_user1.delete()
        dummy_user2.delete()
        dummy_user3.delete()


#-------------------------------------------------------------------------------

#게임방 초대 및 입장 성공 테스트
@pytest.mark.asyncio
async def test_invite_and_join_room_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_1b', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)


        #더미 데이터 입력 
        dummy_user1 = Members.objects.create(nickname = 'dummy1_1b', email = 'dummy@test.com', is_2fa = False)
        dummy_user2 = Members.objects.create(nickname = 'dummy2_1b', email = 'dummy@test.com', is_2fa = False)
    
        invite_user = Members.objects.create(nickname = 'invite_1b', email = 'invite@test.com', is_2fa = False)
        invite_refresh = RefreshToken.for_user(invite_user)
        invite_token = str(invite_refresh.access_token)


        tournament = Tournament.objects.create()

        value = {
            "registered_user": [
                { "user_id" : dummy_user1.id, "channel_id": "123"},
                { "user_id" : dummy_user2.id, "channel_id": "123"},
                { "user_id" : fake_user.id, "channel_id": "123"}],
            "invited_info": [],
            "join_user": [ dummy_user1.id, dummy_user2.id ],
            "join_final_user": []
        }

        cache.set('tournament_' + str(tournament.id), json.dumps(value))


        #fake user가 발급 받은 게임방 아이디로 접속
        join_communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
        join_communicator.scope = await mock_authenticate(join_communicator.scope, fake_user)
        join_connected, join_subprotocol = await join_communicator.connect()

        assert join_connected

        await join_communicator.send_json_to({
            "action": "join_room"    
        })

        #fake_user가 invite_user를 초대
        await join_communicator.send_json_to({
            "action": "invite_room",
            "invite_user_id": invite_user.id
        })

        join_response = await join_communicator.receive_json_from()    
    
        #fake_user가 초대해서 reponse 받은 room id로 invite_user가 토너먼트 초대 수락
        invite_queue_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + invite_token)
        invite_queue_communicator.scope = await mock_authenticate(invite_queue_communicator.scope, invite_user)
        invite_queue_connected, invite_subprotocol = await invite_queue_communicator.connect()

        assert invite_queue_connected

        await invite_queue_communicator.send_json_to({
            "action": "join_invite_tournament_queue",
            "room_id": join_response["tournament_id"]
        })

        invite_queue_response = await invite_queue_communicator.receive_json_from() 

        assert invite_queue_response['status'] == "success"
    
        #TODO: game_queue에서 disconnect 처리 후 넘어가면 오류 발생하는 버그때문에 잠시 주석 처리
        # await invite_queue_communicator.disconnect()


        #초대 수락에 성공한 invite_user가 게임방 아이디로 접속
        invite_communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + invite_token)
        invite_communicator.scope = await mock_authenticate(invite_communicator.scope, invite_user) 
        invite_connected, invite_subprotocol = await invite_communicator.connect()

        assert invite_connected

        await invite_communicator.send_json_to({
            "action": "join_room"    
        })

        invite_response = await invite_communicator.receive_json_from()    

        assert invite_response["status"] == "game_start_soon"

        await invite_communicator.disconnect()
        await join_communicator.disconnect()
    
    finally:
        fake_user.delete()
        dummy_user1.delete()
        dummy_user2.delete()
        invite_user.delete()


#-------------------------------------------------------------------------------

#게임방 2명 입장(결승) 성공 테스트
@pytest.mark.asyncio
async def test_join_final_room_success():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_1c', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)


        #더미 데이터 입력 
        dummy_user1 = Members.objects.create(nickname = 'dummy1_1c', email = 'dummy@test.com', is_2fa = False)
        dummy_user2 = Members.objects.create(nickname = 'dummy2_1c', email = 'dummy@test.com', is_2fa = False)
    
        another_user = Members.objects.create(nickname = 'another_1c', email = 'another@test.com', is_2fa = False)
        another_refresh = RefreshToken.for_user(another_user)
        another_token = str(another_refresh.access_token)
    
        tournament = Tournament.objects.create()

        value = {
            "registered_user": [
                { "user_id" : dummy_user1.id, "channel_id": "123"},
                { "user_id" : dummy_user2.id, "channel_id": "123"},
                { "user_id" : another_user.id, "channel_id": "123"},
                { "user_id" : fake_user.id, "channel_id": "123"}],
            "invited_info": [],
            "join_user": [ dummy_user1.id, dummy_user2.id, another_user.id, fake_user.id ],
            "join_final_user": []
        }

        cache.set('tournament_' + str(tournament.id), json.dumps(value))

        #another_user가 발급 받은 게임방 아이디로 접속
        another_communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + another_token)
        another_communicator.scope = await mock_authenticate(another_communicator.scope, another_user)
        another_connected, another_subprotocol = await another_communicator.connect()

        assert another_connected

        await another_communicator.send_json_to({
            "action": "join_final"
        })

        #fake_user가 발급 받은 게임방 아이디로 접속
        communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_final"
        })  

        response = await communicator.receive_json_from()    

        assert response["status"] == "game_start_soon"

        await communicator.disconnect()

    finally:
        fake_user.delete()
        dummy_user1.delete()
        dummy_user2.delete()
        another_user.delete()


#-------------------------------------------------------------------------------

#게임 방에 입장 후 disconnect 테스트
@pytest.mark.asyncio
async def test_join_room_disconnect():
    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_1d', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)


        #더미 데이터 입력 
        dummy_user1 = Members.objects.create(nickname = 'dummy1_1d', email = 'dummy@test.com', is_2fa = False)
        dummy_user2 = Members.objects.create(nickname = 'dummy2_1d', email = 'dummy@test.com', is_2fa = False)
        dummy_user3 = Members.objects.create(nickname = 'dummy3_1d', email = 'dummy@test.com', is_2fa = False)
    
        tournament = Tournament.objects.create()

        value = {
            "registered_user": [
                { "user_id" : dummy_user1.id, "channel_id": "123"},
                { "user_id" : dummy_user2.id, "channel_id": "123"},
                { "user_id" : dummy_user3.id, "channel_id": "123"},
                { "user_id" : fake_user.id, "channel_id": "123"}],
            "invited_info": [],
            "join_user": [ dummy_user1.id, dummy_user2.id ],
            "join_final_user": []
        }

        cache.set('tournament_' + str(tournament.id), json.dumps(value))


        #발급 받은 게임방 아이디로 접속
        communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_room"
        })

        
        await communicator.disconnect()

    finally:
        fake_user.delete()
        dummy_user1.delete()
        dummy_user2.delete()
        dummy_user3.delete()

        


#결슴 입장 후 disconnect 했을 시, 승패 결과 확인 테스트
@pytest.mark.asyncio
async def test_join_final_room_disconnect():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_1d', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)


        #더미 데이터 입력 
        dummy_user1 = Members.objects.create(nickname = 'dummy1_1d', email = 'dummy@test.com', is_2fa = False)
        dummy_user2 = Members.objects.create(nickname = 'dummy2_1d', email = 'dummy@test.com', is_2fa = False)
    
        another_user = Members.objects.create(nickname = 'another_1d', email = 'another@test.com', is_2fa = False)
        another_refresh = RefreshToken.for_user(another_user)
        another_token = str(another_refresh.access_token)
    
        tournament = Tournament.objects.create()

        value = {
            "registered_user": [
                { "user_id" : dummy_user1.id, "channel_id": "123"},
                { "user_id" : dummy_user2.id, "channel_id": "123"},
                { "user_id" : another_user.id, "channel_id": "123"},
                { "user_id" : fake_user.id, "channel_id": "123"}],
            "invited_info": [],
            "join_user": [ dummy_user1.id, dummy_user2.id, another_user.id, fake_user.id ],
            "join_final_user": []
        }

        cache.set('tournament_' + str(tournament.id), json.dumps(value))

        game1 = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)

        Participant.objects.create(user_id = fake_user, game_id = game1, score = 10, opponent_id = dummy_user1.id, result = Participant.Result.WIN)
        Participant.objects.create(user_id = dummy_user1, game_id = game1, score = 0, opponent_id = fake_user.id, result = Participant.Result.LOSE)

        TournamentGame.objects.create(game_id = game1, tournament_id = tournament, round = TournamentGame.Round.SEMI_FINAL)

        game2 = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)

        Participant.objects.create(user_id = another_user, game_id = game2, score = 10, opponent_id = dummy_user2.id, result = Participant.Result.WIN)
        Participant.objects.create(user_id = dummy_user2, game_id = game2, score = 0, opponent_id = another_user.id, result = Participant.Result.LOSE)

        TournamentGame.objects.create(game_id = game2, tournament_id = tournament, round = TournamentGame.Round.SEMI_FINAL)


        #another_user가 발급 받은 게임방 아이디로 접속
        another_communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + another_token)
        another_communicator.scope = await mock_authenticate(another_communicator.scope, another_user)
        another_connected, another_subprotocol = await another_communicator.connect()

        assert another_connected

        await another_communicator.send_json_to({
            "action": "join_final"
        })

        #fake_user가 발급 받은 게임방 아이디로 접속
        communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
        communicator.scope = await mock_authenticate(communicator.scope, fake_user)
        connected, subprotocol = await communicator.connect()

        assert connected

        await communicator.send_json_to({
            "action": "join_final"
        })  

        response = await communicator.receive_json_from()    

        assert response["status"] == "game_start_soon"

        await communicator.disconnect()

        game_ids = TournamentGame.objects.filter(tournament_id = tournament).values_list('game_id', flat = True)

        user_participants = Participant.objects.get(user_id = fake_user, opponent_id = another_user.id, game_id__in = game_ids)

        assert user_participants.result == Participant.Result.LOSE
                

    finally:
        fake_user.delete()
        dummy_user1.delete()
        dummy_user2.delete()
        another_user.delete()
