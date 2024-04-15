import json

from channels.generic.websocket import AsyncWebsocketConsumer
from members.models import Members
from games.models import Game, Participant
from django.http import JsonResponse
from tournaments.models import Tournament, TournamentGame
from jwt import decode as jwt_decode, exceptions as jwt_exceptions
from utils import get_member_info, bot_notify_process, json_encode
from datetime import datetime, timezone
from channels.db import database_sync_to_async
from django.db import transaction
import asyncio
import random

height = 550
width = height * 1.45

class GameBoard:
    def __init__(self, consumer, player1_id, player2_id):
        self.ball = {'x': width / 2, 'y': height / 2, 'vx': 3, 'vy': 2, 'width': 18, 'height': 18}
        self.paddles = {
            'player1': {'user_id': player1_id, 'x': 40, 'y': height / 2 - 35, 'width': 10, 'height': 100, 'score': 0, 'speed': 10},
            'player2': {'user_id': player2_id, 'x': width - 50, 'y': height / 2 - 35, 'width': 10, 'height': 100, 'score': 0, 'speed': 10}
        }
        self.scores = {'player1': 0, 'player2': 0}
        self.consumer = consumer
        
    async def update_game_state(self):
        # 공 위치 업데이트
        self.ball['x'] += self.ball['vx']
        self.ball['y'] += self.ball['vy']

        # 경계 검사 및 충돌 처리
        if self.ball['y'] <= 0 or self.ball['y'] >= height:
            self.ball['vy'] *= -1

        # 패들 충돌 처리
        await self.check_paddle_collision()

        # 벽 충돌 처리
        if self.ball['x'] <= 0 or self.ball['x'] >= width:
            await self.handle_wall_collision()

    async def reset_ball(self):
        # 공의 속도를 랜덤하게 설정
        vx = random.choice([-1, 1]) * random.uniform(2, 4)  # -4 to -2 또는 2 to 4 사이의 값
        vy = random.choice([-1, 1]) * random.uniform(2, 4)  # -4 to -2 또는 2 to 4 사이의 값

        # 공의 초기 위치와 크기를 설정
        self.ball = {
            'x': width / 2,
            'y': height / 2,
            'vx': vx,
            'vy': vy,
            'width': 18,
            'height': 18
        }

    async def check_paddle_collision(self):
        for player, paddle in self.paddles.items():
            paddle_x = paddle['x']
            paddle_y = paddle['y']
            paddle_width = paddle['width']
            paddle_height = paddle['height']

            # 공의 중심 위치
            ball_center_x = self.ball['x'] + self.ball['width'] / 2
            ball_center_y = self.ball['y'] + self.ball['height'] / 2

            # 패들의 충돌 범위 계산
            paddle_left = paddle_x
            paddle_right = paddle_x + paddle_width
            paddle_top = paddle_y
            paddle_bottom = paddle_y + paddle_height

            # 공이 패들의 x 범위 안에 있는지, y 범위 안에 있는지 검사
            if (paddle_left <= ball_center_x <= paddle_right and
                paddle_top <= ball_center_y <= paddle_bottom):
                self.ball['vx'] *= -1  # x축 방향 반전
                break  # 하나의 패들과만 충돌 가능하므로 추가 검사 불필요

    async def handle_wall_collision(self):
        if self.ball['x'] <= 0:
            self.scores['player2'] += 1
            if self.scores['player2'] == 10:
                player1_score = self.scores['player1']
                player2_score = self.scores['player2']
                await self.consumer.game_over(player1_score, player2_score)
                return
        else:
            self.scores['player1'] += 1
            if self.scores['player1'] == 10:
                player1_score = self.scores['player1']
                player2_score = self.scores['player2']
                await self.consumer.game_over(player1_score, player2_score)
                return
        await self.reset_ball()


class GameBoardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'game_%s' % self.game_id
        self.game_loop_task = None
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        print(f"User {self.user.id} added to group {self.room_group_name} channel_name : {self.channel_name}")

        # 게임 참여자 정보 저장
        participants = await self.get_participants(self.game_id)
        
        # 보드상 왼쪽애 위치
        self.player1_id = participants[0].user_id.id
        # 보드상 오른쪽에 위치
        self.player2_id = participants[1].user_id.id

        self.game_board = GameBoard(self, self.player1_id, self.player2_id)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data['action']
        if action == 'start_game':
            await self.start_game()
        if action == 'ready_game':
            await self.press_ready()
        if action == 'press_key':
            await self.move_paddle(data)
            await self.broadcast_game_state()

    async def start_game(self):
        self.game_loop_task = asyncio.ensure_future(self.game_loop())
        await self.broadcast_game_state()

    async def game_loop(self):
        try:
            while True:
                await self.game_board.update_game_state()
                await self.broadcast_game_state()
                await asyncio.sleep(1/60)  # 게임 상태 업데이트 주기
        except asyncio.CancelledError:
            print("Game loop has been cancelled")

    async def broadcast_game_state(self):
        self.game_board.paddles['player1']['score'] = self.game_board.scores['player1']
        self.game_board.paddles['player2']['score'] = self.game_board.scores['player2']
        game_state = {
            'ball': self.game_board.ball,
            'paddles': self.game_board.paddles
        }
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'update_board_state',
                'data': game_state
            }
        )

    async def disconnect(self, close_code):
        if self.game_loop_task and not self.game_loop_task.done():
            self.game_loop_task.cancel()
        # 게임이 완전히 끝나지 않았다면, 점수가 10 미만인 경우
        if self.game_board.scores['player1'] < 10 and self.game_board.scores['player2'] < 10:
            try:
                # 먼저 접속이 끊긴 쪽이 패배로 처리
                loser = self.user.id
                winner = self.player2_id if loser == self.player1_id else self.player1_id

                # 결과 업데이트
                await self.update_participant_result(loser, Participant.Result.LOSE)
                await self.update_participant_result(winner, Participant.Result.WIN)

                # 게임 종료 시간 저장
                await self.update_game_end_time(self.game_id)

                # 상대방에게 게임 종료 메시지 전송
                opponent_channel_name = self.channel_layer.group_discard(self.room_group_name, self.channel_name)
                if opponent_channel_name:
                    await self.channel_layer.send(
                        opponent_channel_name,
                        {
                            'type': 'broadcast_game_status',
                            'message': 'game_over',
                            'game_status': [
                                {"user_id": loser, "score": self.game_board.scores['player1'], "result": Participant.Result.LOSE},
                                {"user_id": winner, "score": self.game_board.scores['player2'], "result": Participant.Result.WIN}
                            ]
                        }
                    )
            except Exception as e:
                await self.send(text_data=json_encode({
                    "status": "fail",
                    "message": "redis에 접근 중 오류가 발생했습니다"
                }))
                return
        tournament_entry = Tournament.objects.filter(game_id=self.game_id, round='FINAL').first()
        if tournament_entry:
            players = await self.get_tournament_players(self.tournament_game.tournament_id.id)
            await bot_notify_process(self, self.user.id, "bot_notify_tournament_game_result", players)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    #game status 알림
    async def broadcast_game_status(self, event):

        await self.send(text_data=json_encode({
            "action": event["data"]["action"],
            "game_status": event["data"]["game_status"]
        }))

    async def press_ready(self):
        await self.channel_layer.group_send(
            self.room_group_name,  # 게임 ID 또는 그룹을 기반으로 한 채널 그룹
            {
                "type": "user_ready",  # 처리할 메소드 명
                "user_id": self.scope["user"].id  # 준비한 유저의 ID
            }
        )

    async def user_ready(self, event):
        # 클라이언트에게 준비 상태 방송
        await self.send(text_data=json_encode({
            "action": "user_ready",
            "user_id": event["user_id"]
        }))

    async def update_board_state(self, event):
        data = event['data']
        # 게임 보드 상태 업데이트
        self.game_board.ball.update(data['ball'])
        self.game_board.paddles['player1'].update(data['paddles']['player1'])
        self.game_board.paddles['player2'].update(data['paddles']['player2'])
        self.game_board.scores['player1'] = data['paddles']['player1']['score']
        self.game_board.scores['player2'] = data['paddles']['player2']['score']
        await self.send(text_data=json_encode({
            "action": "update_board_state",
            "data": event['data']
        }))
    
    async def game_over(self, player1_score, player2_score):
        await self.broadcast_game_state()

        # 결과 판정
        if player1_score > player2_score:
            player1_result = Participant.Result.WIN
            player2_result = Participant.Result.LOSE
        else:
            player1_result = Participant.Result.LOSE
            player2_result = Participant.Result.WIN

        # 결과 업데이트를 데이터베이스에 반영
        await self.update_participant_results(
            self.player1_id, self.game_id, self.player2_id, player1_result, player1_score)
        await self.update_participant_results(
            self.player2_id, self.game_id, self.player1_id, player2_result, player2_score)

        await self.update_game_end_time(self.game_id)
        
        game_over_message = {
        'action': 'game_over',
        'game_status': [
            {"user_id": self.player1_id, "score": self.game_board.scores['player1'], "result": player1_result},
            {"user_id": self.player2_id, "score": self.game_board.scores['player2'], "result": player2_result}
            ]
        }

        await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_game_status',
                    'data': game_over_message
                })

    async def broadcast_game_over(self, event):
        await self.send(text_data=json_encode(event['data']))

    async def get_tournament_players(self, tournament_id):
        tournament_games = TournamentGame.objects.filter(tournament_id=tournament_id)
        
        players = set()
        
        for game in tournament_games:
            participants = Participant.objects.filter(game_id=game.game_id)
            for participant in participants:
                player = await get_member_info(participant.user_id)
                ranking = 0
                if game.round == TournamentGame.Round.SEMI_FINAL:
                    if participant.result == Participant.Result.LOSE:
                        ranking = 3
                if game.round == TournamentGame.Round.FINAL:
                    if participant.result == Participant.Result.WIN:
                        ranking = 1
                    elif participant.result == Participant.Result.LOSE:
                        ranking = 2
                players.add({
                    **player,
                    "ranking": ranking,
                })
        return players

    async def broadcast_press_key(self, event):

        await self.send(text_data=json_encode({
                "status": event["status"],
                "action": event["action"],
                "key": event["key"]
            }))

    async def move_paddle(self, data):
        user_id = self.user.id
        direction = data['key']
        paddle = self.game_board.paddles['player1'] if self.game_board.paddles['player1']['user_id'] == user_id else self.game_board.paddles['player2']

        if direction == 1:
            paddle['y'] = max(0, paddle['y'] - paddle['speed'])
        elif direction == 0:
            paddle['y'] = min(height - paddle['height'], paddle['y'] + paddle['speed'])

    #unpress key 알림
    async def broadcast_unpress_key(self, event):

        await self.send(text_data=json_encode({
                "status": event["status"],
                "action": event["action"]
            }))

    #round_start 알림
    async def broadcast_round_start(self, event):
        await self.send(text_data=json_encode({
            "status": event["status"],
            "action": event["action"],
            "ball_position" : event["ball_posit)ion"]
        }))


    #game을 가져오는 비동기 함수
    @database_sync_to_async
    def get_game(self, game_id):
        try:
            return Game.objects.get(id = game_id)
        except:
            return JsonResponse({
                'code': 404,
                'message': 'Not Found'
            }, status = 404)


    #game을 저장하는 비동기 함수
    @database_sync_to_async
    def save_game(self, game):
        game.save()

    #participant을 가져오는 비동기 함수
    @database_sync_to_async
    def get_participant(self, user_id, game_id):
        return Participant.objects.get(user_id = user_id, game_id = game_id)
    
    @database_sync_to_async
    def get_participants(self, game_id):
        return Participant.objects.filter(game_id=game_id)

    #participant을 저장하는 비동기 함수
    @database_sync_to_async
    def save_participant(self, participant):
        participant.save()

    #members을 가져오는 비동기 함수
    @database_sync_to_async
    def get_members(self, id):
        return Members.objects.get(id = id)

    #tournament game을 가져오는 비동기함수
    def get_tournament_game(self, game_id):
        return TournamentGame.objects.get(game_id = game_id)

    @database_sync_to_async
    def update_participant_results(self, user_id, game_id, opponent_id, result, score):
        with transaction.atomic():
            participant, created = Participant.objects.update_or_create(
                user_id=user_id,
                game_id=game_id,
                defaults={
                    'opponent_id': opponent_id,
                    'result': result,
                    'score': score
                }
            )
            return participant

    @database_sync_to_async
    def update_participant_result(self, user_id, result):
        participant = Participant.objects.get(user_id=user_id, game_id=self.game_id)
        participant.result = result
        participant.save()

    @database_sync_to_async
    def update_game_end_time(self, game_id):
        game = Game.objects.get(id=game_id)
        game.end_time = datetime.now(timezone.utc)
        game.save()
