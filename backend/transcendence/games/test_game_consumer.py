import asyncio
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
django.setup()

import pytest
from channels.testing import WebsocketCommunicator
from .game_consumer import GameConsumer
from .game_queue_consumer import GameQueueConsumer
from .game_room_consumer import GameRoomConsumer
from channels.layers import get_channel_layer
import json
from members.models import Members
from games.models import Game, Participant
from tournaments.models import Tournament
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
from django.core.cache import cache


async def mock_authenticate(scope, user):
    scope['user'] = user
    return scope

#노말모드에서 1점 먹은 것과, 10점 먹었을 때의 성공 테스트
@pytest.mark.asyncio
async def test_normal_round_win_success():

    try:
        channel_layer = get_channel_layer()

        #테스트용 토큰 발급
        fake_user = Members.objects.create(nickname = 'test_1', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        invite_user = Members.objects.create(nickname = 'invite_1', email = 'invite@test.com', is_2fa = False)
        invite_refresh = RefreshToken.for_user(invite_user)
        invite_token = str(invite_refresh.access_token)

        #fake_user가 invite_user 초대
        invite_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        invite_communicator.scope = await mock_authenticate(invite_communicator.scope, fake_user)
        invite_connected, invite_subprotocol = await invite_communicator.connect()

        assert invite_connected

        await invite_communicator.send_json_to({
            "action": "invite_normal_queue",
            "game_mode": Game.GameOption.CLASSIC,
            "invite_user_id": invite_user.id    
        })

        invite_response = await invite_communicator.receive_json_from()    

        assert invite_response["status"] == "game create success"

        join_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + invite_token)
        join_communicator.scope = await mock_authenticate(join_communicator.scope, invite_user)
        join_connected, invite_subprotocol = await join_communicator.connect()


        assert join_connected

        await join_communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": invite_response["game_id"]
        })

        join_response = await join_communicator.receive_json_from()    

        assert join_response["status"] == "game_start_soon"


        await invite_communicator.disconnect()
        await join_communicator.disconnect()


        #게임방 입장
        fake_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + fake_token)
        fake_communicator.scope = await mock_authenticate(fake_communicator.scope, fake_user)
        fake_connected, fake_subprotocol = await fake_communicator.connect()

        assert fake_connected


        opponent_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + invite_token)
        opponent_communicator.scope = await mock_authenticate(opponent_communicator.scope, invite_user)
        opponent_connected, opponent_subprotocol = await opponent_communicator.connect()    

        assert opponent_connected

        #게임 1번 이겼을 때 성공 테스트
        await fake_communicator.send_json_to({
            "action": "round_win"
        })

        round_win_response = await fake_communicator.receive_json_from()    

        assert round_win_response["status"] == "round_over"

        #게임 10번 이겼을 때 성공 테스트
        for i in range(1, 10):
            await fake_communicator.send_json_to({
                "action": "round_win",
            })
            if (i != 9):
                await fake_communicator.receive_json_from()
        
        game_over_response = await fake_communicator.receive_json_from()

        print(game_over_response)
        assert game_over_response["status"] == "game_over"

    finally:
        fake_user.delete()
        invite_user.delete()




#----------------------------------------------------------------------------------

#노말모드에서 press_key 테스트
@pytest.mark.asyncio
async def test_normal_press_key_success():
    try:
        channel_layer = get_channel_layer()

        #테스트용 토큰 발급
        fake_user = Members.objects.create(nickname = 'test_2', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        invite_user = Members.objects.create(nickname = 'invite_2', email = 'invite@test.com', is_2fa = False)
        invite_refresh = RefreshToken.for_user(invite_user)
        invite_token = str(invite_refresh.access_token)

        #fake_user가 invite_user 초대
        invite_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        invite_communicator.scope = await mock_authenticate(invite_communicator.scope, fake_user)
        invite_connected, invite_subprotocol = await invite_communicator.connect()

        assert invite_connected

        await invite_communicator.send_json_to({
            "action": "invite_normal_queue",
            "game_mode": Game.GameOption.CLASSIC,
            "invite_user_id": invite_user.id
        })

        invite_response = await invite_communicator.receive_json_from()    

        assert invite_response["status"] == "game create success"

        join_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + invite_token)
        join_communicator.scope = await mock_authenticate(join_communicator.scope, invite_user)
        join_connected, invite_subprotocol = await join_communicator.connect()


        assert join_connected

        await join_communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": invite_response["game_id"]
        })

        join_response = await join_communicator.receive_json_from()    

        assert join_response["status"] == "game_start_soon"


        await invite_communicator.disconnect()
        await join_communicator.disconnect()


        #게임방 입장
        fake_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + fake_token)
        fake_communicator.scope = await mock_authenticate(fake_communicator.scope, fake_user)
        fake_connected, fake_subprotocol = await fake_communicator.connect()

        assert fake_connected


        opponent_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + invite_token)
        opponent_communicator.scope = await mock_authenticate(opponent_communicator.scope, invite_user)
        opponent_connected, opponent_subprotocol = await opponent_communicator.connect()    

        assert opponent_connected

        #press key 테스트
        await fake_communicator.send_json_to({
            "action": "press_key",
            "key": 1
        })

        response = await opponent_communicator.receive_json_from()

        assert response['status'] == 'success'
        assert response['action'] == 'press_key'
    
    finally:
        fake_user.delete()
        invite_user.delete()


#----------------------------------------------------------------------------------
#토너먼트(결승)인 경우 win 테스트 
@pytest.mark.asyncio
async def test_tournament_round_win():

    try:
        channel_layer = get_channel_layer()

        # 테스트용 토큰 발급(비동기적으로 실행되기에 테스트용 데이터를 pytest.fixture로 하나로 묶을 수 없음)
        fake_user = Members.objects.create(nickname = 'test_3', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)


        #더미 데이터 입력 
        dummy_user1 = Members.objects.create(nickname = 'dummy_1', email = 'dummy@test.com', is_2fa = False)
        dummy_user2 = Members.objects.create(nickname = 'dummy_2', email = 'dummy@test.com', is_2fa = False)
    
        another_user = Members.objects.create(nickname = 'another_3', email = 'another@test.com', is_2fa = False)
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
        final_communicator = WebsocketCommunicator(GameRoomConsumer.as_asgi(), "/ws/join_room/" + str(tournament.id) +"?token=" + fake_token)
        final_communicator.scope = await mock_authenticate(final_communicator.scope, fake_user)
        final_connected, subprotocol = await final_communicator.connect()

        assert final_connected

        await final_communicator.send_json_to({
            "action": "join_final"
        })

        final_response = await final_communicator.receive_json_from()    

        assert final_response["status"] == "game_start_soon"


        fake_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(final_response["game_id"]) + "?token=" + fake_token)
        fake_communicator.scope = await mock_authenticate(fake_communicator.scope, fake_user)
        fake_connected, fake_subprotocol = await fake_communicator.connect()

        assert fake_connected


        opponent_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(final_response["game_id"]) + "?token=" + another_token)
        opponent_communicator.scope = await mock_authenticate(opponent_communicator.scope, another_user)
        opponent_connected, opponent_subprotocol = await opponent_communicator.connect()    

        assert opponent_connected

        #게임 1번 이겼을 때 성공 테스트
        await fake_communicator.send_json_to({
            "action": "round_win"
        })

        round_win_response = await fake_communicator.receive_json_from()    

        assert round_win_response["status"] == "round_over"

        #게임 10번 이겼을 때 성공 테스트
        for i in range(1, 10):
            await fake_communicator.send_json_to({
                "action": "round_win"
            })
            if (i != 9):
                await fake_communicator.receive_json_from() 
        
        game_over_response= await fake_communicator.receive_json_from()

        assert game_over_response["status"] == "game_over"

    finally:
        fake_user.delete()
        dummy_user1.delete()
        dummy_user2.delete()
        another_user.delete()


#----------------------------------------------------------------------------------
#게임 진행 중 한 사람이 나갔을 때 테스트
@pytest.mark.asyncio
async def test_disconnect():
    try:
        channel_layer = get_channel_layer()

        #테스트용 토큰 발급
        fake_user = Members.objects.create(nickname = 'test_5', email = 'testUser@test.com', is_2fa = False)
        refresh = RefreshToken.for_user(fake_user)
        fake_token = str(refresh.access_token)

        invite_user = Members.objects.create(nickname = 'invite_4', email = 'invite@test.com', is_2fa = False)
        invite_refresh = RefreshToken.for_user(invite_user)
        invite_token = str(invite_refresh.access_token)

        #fake_user가 invite_user 초대
        invite_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
        invite_communicator.scope = await mock_authenticate(invite_communicator.scope, fake_user)
        invite_connected, invite_subprotocol = await invite_communicator.connect()

        assert invite_connected

        await invite_communicator.send_json_to({
            "action": "invite_normal_queue",
            "game_mode": Game.GameOption.CLASSIC,
            "invite_user_id": invite_user.id    
        })

        invite_response = await invite_communicator.receive_json_from()    

        assert invite_response["status"] == "game create success"

        join_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + invite_token)
        join_communicator.scope = await mock_authenticate(join_communicator.scope, invite_user)
        join_connected, invite_subprotocol = await join_communicator.connect()


        assert join_connected

        await join_communicator.send_json_to({
            "action": "join_invite_normal_queue",
            "game_id": invite_response["game_id"]
        })

        join_response = await join_communicator.receive_json_from()    

        assert join_response["status"] == "game_start_soon"


        await invite_communicator.disconnect()
        await join_communicator.disconnect()


        #게임방 입장
        fake_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + fake_token)
        fake_communicator.scope = await mock_authenticate(fake_communicator.scope, fake_user)
        fake_connected, fake_subprotocol = await fake_communicator.connect()

        assert fake_connected


        opponent_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + invite_token)
        opponent_communicator.scope = await mock_authenticate(opponent_communicator.scope, invite_user)
        opponent_connected, opponent_subprotocol = await opponent_communicator.connect()    

        assert opponent_connected

        await fake_communicator.send_json_to({
                "action": "round_win"
            })
        await fake_communicator.receive_json_from()
        await opponent_communicator.receive_json_from()

        await fake_communicator.disconnect()

        game_end_response = await opponent_communicator.receive_json_from()

    
        assert game_end_response["status"] == "game_over"

        fake_participant = Participant.objects.get(user_id = fake_user.id, game_id = invite_response["game_id"])
    
        assert fake_participant.result == Participant.Result.LOSE

    finally:
        fake_user.delete()
        invite_user.delete()