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
from channels.layers import get_channel_layer
import json
from members.models import Members
from games.models import Game, Participant
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
from django.core.cache import cache

@pytest.mark.asyncio
async def test_round_win_success():

    channel_layer = get_channel_layer()

    #테스트용 토큰 발급
    fake_user = Members.objects.create(nickname = 'test_user', email = 'testUser@test.com', is_2fa = False)
    refresh = RefreshToken.for_user(fake_user)
    fake_token = str(refresh.access_token)

    invite_user = Members.objects.create(nickname = 'invite_user', email = 'invite@test.com', is_2fa = False)
    invite_refresh = RefreshToken.for_user(invite_user)
    invite_token = str(invite_refresh.access_token)

    invite_time = datetime(2024, 2, 19, 12, 0, 0)
    accept_time = datetime(2024, 2, 19, 12, 0, 42)

    iso_8601_accept_time = accept_time.isoformat()
    iso_8601_invite_time = invite_time.isoformat()


    #fake_user가 invite_user 초대
    invite_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + fake_token)
    invite_connected, invite_subprotocol = await invite_communicator.connect()

    assert invite_connected

    await invite_communicator.send_json_to({
        "action": "invite_normal_queue",
        "game_mode": Game.GameOption.CLASSIC,
        "user_id": fake_user.id,
        "invite_user_id": invite_user.id,
        "invite_time": iso_8601_invite_time
    })

    invite_response = await invite_communicator.receive_json_from()    

    assert invite_response["status"] == "game create success"

    join_communicator = WebsocketCommunicator(GameQueueConsumer.as_asgi(), "/ws/join_queue?token=" + invite_token)
    join_connected, invite_subprotocol = await join_communicator.connect()


    assert join_connected

    await join_communicator.send_json_to({
        "action": "join_invite_normal_queue",
        "game_id": invite_response["game_id"],
        "accept_time": iso_8601_accept_time,
        "user_id": invite_user.id
    })

    join_response = await join_communicator.receive_json_from()    

    assert join_response["status"] == "game_start_soon"


    await invite_communicator.disconnect()
    await join_communicator.disconnect()


    #게임방 입장
    fake_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + fake_token)
    fake_connected, fake_subprotocol = await fake_communicator.connect()

    assert fake_connected


    opponent_communicator = WebsocketCommunicator(GameConsumer.as_asgi(), "/ws/game/" + str(invite_response["game_id"]) + "?token=" + invite_token)
    opponent_connected, opponent_subprotocol = await opponent_communicator.connect()    

    assert opponent_connected

    #게임 1번 이겼을 때 성공 테스트
    await fake_communicator.send_json_to({
        "action": "round_win",
    })

    round_win_response = await fake_communicator.receive_json_from()    

    assert round_win_response["status"] == "round_over"

    #게임 10번 이겼을 때 성공 테스트
    for i in range(1, 10):
        await fake_communicator.send_json_to({
            "action": "round_win",
        })
        game_over_response= await fake_communicator.receive_json_from()

    assert game_over_response["status"] == "normal_game_over"



         
