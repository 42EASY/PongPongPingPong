import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from members.models import Members
from games.models import Game, Participant
from tournaments.models import Tournament, TournamentGame
from django.core.cache import cache
from urllib.parse import parse_qs
from jwt import decode as jwt_decode, exceptions as jwt_exceptions
from django.conf import settings
from games.distributed_lock import DistributedLock
from utils import get_member_info, bot_notify_process
from datetime import datetime, timezone
from channels.db import database_sync_to_async

prefix_normal = "normal_"
prefix_tournament = "tournament_"

class GameConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        path = self.scope['path']
        self.game_id = path.strip('/').split('/')[-1]
        self.user = self.scope['user']

        self.lock = DistributedLock()

        #game_id 검증
        try:
            self.game = await self.get_game(self.game_id)
        except:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 game id 입니다"
            })
            return

        self.game_mode = self.game.game_mode
        
        #start_time 저장
        self.game.start_time = datetime.now(timezone.utc)
        
        await self.save_game(self.game)
        self.game = await self.get_game(self.game_id)

        #노멀 게임인 경우
        if (self.game_mode == Game.GameMode.NORMAL):
            self.key = prefix_normal + self.game_id

        #토너먼트인 경우
        elif (self.game_mode == Game.GameMode.TOURNAMENT):
            self.tournament_game = await self.get_tournament_game(self.game)

            self.key = prefix_tournament + str(self.tournament_game.tournament_id.id)

            
        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get(self.key)
            except:
                self.lock.release_lock()
                await self.send_json({
                    "status": "fail",
                    "message": "redis에 접근 중 오류가 발생했습니다"
                })
                return
            
            self.lock.release_lock()
        else:
            self.lock.release_lock()
            await self.send_json({
                "status": "fail",
                "message": "lock 획득 중 오류가 발생했습니다"
            })
            return
            
            
        parsed_value = json.loads(value)

        #게임에 입장한 user id와 channel_name 저장
        self.json_key = 'join_game' + str(self.game_id)

        if self.json_key not in parsed_value or not isinstance(parsed_value[self.json_key], list):
            parsed_value[self.json_key] = []
                
        data = {
            'user_id': self.user.id,
            'channel_name': self.channel_name
        }

        parsed_value[self.json_key].append(data)

            
        updated_value = json.dumps(parsed_value)

        if self.lock.acquire_lock():
            try:
                cache.set(self.key, updated_value)
            except:
                self.lock.release_lock()
                await self.send_json({
                    "status": "fail",
                    "message": "redis에 접근 중 오류가 발생했습니다"
                })
                return  
            
            self.lock.release_lock()
        else:
            self.lock.release_lock()
            await self.send_json({
                "status": "fail",
                "message": "lock 획득 중 오류가 발생했습니다"
            })
            return

        
        self.opponent_channel_name = "-1"
        await self.accept()



    async def disconnect(self, close_code):
        #game이 다 끝나지 않은 경우
        if (self.user_participant.score < 10 and self.opponent_participant.score < 10):
            try:
                #점수 상관없이 먼저 접속 끊은 쪽이 lose
                self.user_participant.result = Participant.Result.LOSE
                self.opponent_participant.result = Participant.Result.WIN

                await self.save_participant(self.user_participant)
                await self.save_participant(self.opponent_participant)

                self.user_participant = await self.get_participant(self.user.id, self.game_id)
                self.opponent_participant = await self.get_participant(self.opponent.id, self.game_id)

                #end_time 저장
                self.game.end_time = datetime.now(timezone.utc)
                
                await self.save_game(self.game)
                self.game = await self.get_game(self.game_id)
            
            except:
                await self.send_json({
                    "status": "fail",
                    "message": "redis에 접근 중 오류가 발생했습니다"
                })
                return  

            #상대에게 게임이 끝냈다고 방송
            if (self.opponent_channel_name != "-1"):
                await self.channel_layer.send(
                    self.opponent_channel_name,
                    {
                        'type': 'broadcast_game_status',
                        'message': 'game_over',
                        'game_status': [{ "user_id" : self.user.id, "score": self.user_participant.score }, 
                                    { "user_id" : self.opponent.id, "score" : self.opponent_participant.score}]
                    })

    

    #connect 이후 receive 및 send 할 내용 정의
    async def receive(self, text_data):

        #상대의 channel_name 저장
        if (self.opponent_channel_name == "-1"):

            value = None
            if self.lock.acquire_lock():
                try:
                    value = cache.get(self.key)
                except:
                    self.lock.release_lock()
                    await self.send_json({
                        "status": "fail",
                        "message": "redis에 접근 중 오류가 발생했습니다"
                    })
                    return  
            
                self.lock.release_lock()
            else:
                self.lock.release_lock()
                await self.send_json({
                    "status": "fail",
                    "message": "lock 획득 중 오류가 발생했습니다"
                })
                return

            parsed_value = json.loads(value)
            
            join_game_info = parsed_value[self.json_key]

            flag = False
            for info in join_game_info:
                if (info['user_id'] != self.user.id):
                    flag = True
                    try:
                        self.opponent = await self.get_members(info["user_id"])

                        #user의 participant에 상대 id 값 추가
                        self.user_participant = await self.get_participant(self.user, self.game)
                        self.user_participant.opponent_id = self.opponent.id
                        await self.save_participant(self.user_participant)
                        self.user_participant = await self.get_participant(self.user, self.game)

                        #상대 particiaptn 객체와 channel_name 저장
                        self.opponent_participant = await self.get_participant(self.opponent, self.game)
                        self.opponent_channel_name = info['channel_name']
                        await self.save_participant(self.opponent_participant)
                        self.opponent_participant = await self.get_participant(self.opponent, self.game)

                    except:
                        await self.send_json({
                            "status": "fail",
                            "message": "db접근 중 오류가 발생했습니다"
                        })
                        return

            if (flag == False):
                await self.send_json({
                    "status": "fail",
                    "message": "아직 상대가 입장하지 않았습니다"
                })
                return


        text_data_json = json.loads(text_data)

        action = text_data_json["action"]

        if (action == "round_win"):
            await self.round_over()
        elif (action == "press_key"):
            await self.press_key(text_data_json)
        elif (action == "unpress_key"):
            await self.unpress_key()
        elif (action == "round_start"):
            await self.round_start(text_data_json)
        else:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 action 입니다"
            })

    #round_start (공 초기 위치 설정)
    async def round_start(self, text_data_json):
        await self.channel_layer.send(
            self.opponent_channel_name,
            {
                'type': 'broadcast_round_start',
                'status': 'success',
                'action': 'round_start',
                'ball_position': text_data_json["ball_position"]
            })


    #user가 key를 뗀 경우
    async def unpress_key(self):
    
        #상대에게 키를 뗐음을 알리기
        await self.channel_layer.send(
            self.opponent_channel_name,
            {
                'type': 'broadcast_unpress_key',
                'status': 'success',
                'action': 'unpress_key',
            })


    #user가 key를 누른 경우
    async def press_key(self, text_data_json):
        UP = 1
        DOWN = 0

        key = text_data_json["key"]

        if (key != UP and key != DOWN):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 key 입니다"
            })
            return
        

        #상대에게 키 눌렀음 알리기
        await self.channel_layer.send(
            self.opponent_channel_name,
            {
                'type': 'broadcast_press_key',
                'status': 'success',
                'action': 'press_key',
                'key': key 
            })
        
    #한 라운드가 끝난 경우(round_win이라는 action 보낸 사람이 1점을 얻은 경우)
    async def round_over(self):
        self.user_participant.score = self.user_participant.score + 1
        
        await self.save_participant(self.user_participant)
        self.user_participant = await self.get_participant(self.user.id, self.game_id)

        self.opponent_participant = await self.get_participant(self.opponent.id, self.game_id)

        #10점인 경우 게임 over 알림
        if (self.user_participant.score == 10):
            
            self.user_participant.result = Participant.Result.WIN
            self.opponent_participant.result = Participant.Result.LOSE

            await self.save_participant(self.user_participant)
            await self.save_participant(self.opponent_participant)

            self.user_participant = await self.get_participant(self.user.id, self.game_id)
            self.opponent_participant = await self.get_participant(self.opponent.id, self.game_id)

            #end_time 저장
            self.game.end_time = datetime.now(timezone.utc)

            await self.save_game(self.game)
            self.game = await self.get_game(self.game_id)


            #게임 종료 방송
            await self.channel_layer.send(
                self.channel_name,
                {
                    'type': 'broadcast_game_status',
                    'message': 'game_over',
                    'game_status': [{ "user_id" : self.user.id, "score": self.user_participant.score }, 
                                    { "user_id" : self.opponent.id, "score" : self.opponent_participant.score}]
                })
            
            await self.channel_layer.send(
                    self.opponent_channel_name,
                    {
                        'type': 'broadcast_game_status',
                        'message': 'game_over',
                        'game_status': [{ "user_id" : self.user.id, "score": self.user_participant.score }, 
                                    { "user_id" : self.opponent.id, "score" : self.opponent_participant.score}]
                    })

            #normal 게임이거나, tournament 결승 게임인 경우 redis 삭제
            if (self.game_mode == Game.GameMode.NORMAL or self.tournament_game.round == TournamentGame.Round.FINAL):
                if (self.tournament_game.round == TournamentGame.Round.FINAL):
                    players = await self.get_tournament_players(self.tournament_game.tournament_id.id)
                    await bot_notify_process(self, self.user.id, "bot_notify_tournament_game_result", players)
                if self.lock.acquire_lock():
                    try:
                        cache.delete(self.key)
                    except:
                        self.lock.release_lock()
                        await self.send_json({
                            "status": "fail",
                            "message": "redis에 접근 중 오류가 발생했습니다"
                        })
                        return  
            
                    self.lock.release_lock()
                else:
                    self.lock.release_lock()
                    await self.send_json({
                        "status": "fail",
                        "message": "lock 획득 중 오류가 발생했습니다"
                    })
                    return
            

        #승점 10점이 아닌 경우
        else:
           await self.channel_layer.send(
                self.channel_name,
                {
                    'type': 'broadcast_game_status',
                    'message': 'round_over',
                    'game_status': [{ "user_id" : self.user.id, "score": self.user_participant.score }, 
                                    { "user_id" : self.opponent.id, "score" : self.opponent_participant.score}]
                })
           await self.channel_layer.send(
                self.opponent_channel_name,
                {
                    'type': 'broadcast_game_status',
                    'message': 'round_over',
                    'game_status': [{ "user_id" : self.user.id, "score": self.user_participant.score }, 
                                    { "user_id" : self.opponent.id, "score" : self.opponent_participant.score}]
                })
           




    #game status 알림
    async def broadcast_game_status(self, event):

        await self.send_json({
            "status": event["message"],
            "game_status": event["game_status"]
        })

        
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

        await self.send_json({
                "status": event["status"],
                "action": event["action"],
                "key": event["key"]
            })

    #unpress key 알림
    async def broadcast_unpress_key(self, event):

        await self.send_json({
                "status": event["status"],
                "action": event["action"]
            })

    #round_start 알림
    async def broadcast_round_start(self, event):
        await self.send_json({
            "status": event["status"],
            "action": event["action"],
            "ball_position" : event["ball_position"]
        })


    #game을 가져오는 비동기 함수
    @database_sync_to_async
    def get_game(self, game_id):
        return Game.objects.get(id = game_id)

    #game을 저장하는 비동기 함수
    @database_sync_to_async
    def save_game(self, game):
        game.save()

    #participant을 가져오는 비동기 함수
    @database_sync_to_async
    def get_participant(self, user_id, game_id):
        return Participant.objects.get(user_id = user_id, game_id = game_id)
    
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
