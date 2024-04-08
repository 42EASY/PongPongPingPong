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
import datetime

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
            self.game = Game.objects.get(id = self.game_id)
        except:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 game id 입니다"
            })
            return

        self.game_mode = self.game.game_mode
        
        #start_time 저장
        self.game.start_time = datetime.datetime.now()
        self.game.save()

        #노멀 게임인 경우
        if (self.game_mode == Game.GameMode.NORMAL):
            self.key = prefix_normal + self.game_id

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

            registered_user = parsed_value["registered_user"]

            flag = False
            idx = -1
            for user in registered_user:
                idx += 1
                if (user["user_id"] != self.user.id):
                    try:
                        self.opponent = Members.objects.get(id = user["user_id"])

                        #user의 participant에 상대 id 값 추가
                        self.user_participant = Participant.objects.get(user_id = self.user, game_id = self.game)
                        self.user_participant.opponent_id = self.opponent.id
                        self.user_participant.save()

                        self.opponent_participant = Participant.objects.get(user_id = Members.objects.get(id = self.opponent.id), game_id = self.game)

                    except:
                        await self.send_json({
                            "status": "fail",
                            "message": "상대 플레이어가 존재하지 않습니다"
                        })
                        return

                else:
                    #channel_id 갱신
                    parsed_value["registered_user"][idx]["channel_id"] = self.channel_name
                    flag = True
                
                    
            if (flag == False):
                await self.send_json({
                    "status": "fail",
                    "message": "등록되지 않은 유저입니다"
                })
                return
            
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

        #토너먼트인 경우
        if (self.game_mode == Game.GameMode.TOURNAMENT):
            self.tournament_game = TournamentGame.objects.get(game_id = self.game)

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

            registered_user = parsed_value["registered_user"]

            try:
                self.user_participant = Participant.objects.get(user_id = self.user, game_id = self.game)
                self.opponent = Members.objects.get(id = self.user_participant.opponent_id)
                self.opponent_participant = Participant.objects.get(user_id = Members.objects.get(id = self.opponent.id), game_id = self.game)            
            except:
                await self.send_json({
                    "status": "fail",
                    "message": "db에서 오류가 발생했습니다"
                })
                return

            flag = False
            idx = -1
            for user in registered_user:
                idx += 1
                if (user["user_id"] != self.user.id):
                    #channel_id 갱신
                    parsed_value["registered_user"][idx]["channel_id"] = self.channel_name
                    flag = True
                    break

                    
            if (flag == False):
                await self.send_json({
                    "status": "fail",
                    "message": "등록되지 않은 유저입니다"
                })
                return
            
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

        self.opponent_channel_name = -1
        await self.accept()



    async def disconnect(self, close_code):
        #game이 다 끝나지 않은 경우
        if (self.user_participant.score < 10 and self.opponent_participant.score < 10):
            #점수 상관없이 먼저 접속 끊은 쪽이 lose
            self.user_participant.result = Participant.Result.LOSE
            self.opponent_participant.result = Participant.Result.WIN

            self.user_participant.save()
            self.opponent_participant.save()

            #end_time 저장
            self.game.end_time = datetime.datetime.now()
            self.game.save()

            #상대에게 게임이 끝냈다고 방송
            if (self.opponent_channel_name != -1):
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
        if (self.opponent_channel_name == -1):

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

            registered_user = parsed_value["registered_user"]

            for info in registered_user:
                if (info["user_id"] == self.opponent.id):
                    self.opponent_channel_name = info["channel_id"]


        text_data_json = json.loads(text_data)

        action = text_data_json["action"]

        if (action == "round_win"):
            await self.round_over()
        elif (action == "press_key"):
            await self.press_key(text_data_json)
        else:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 action 입니다"
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
        

    #press key 알림
    async def broadcast_press_key(self, event):

        await self.send_json({
                "status": event["status"],
                "action": event["action"],
                "key": event["key"]
            })



    
    #한 라운드가 끝난 경우(round_win이라는 action 보낸 사람이 1점을 얻은 경우)
    async def round_over(self):
        self.user_participant.score = self.user_participant.score + 1
        self.user_participant.save()

        #10점인 경우 게임 over 알림
        if (self.user_participant.score == 10):
            
            self.user_participant.result = Participant.Result.WIN
            self.opponent_participant.result = Participant.Result.LOSE

            self.user_participant.save()
            self.opponent_participant.save()
            
            #end_time 저장
            self.game.end_time = datetime.datetime.now()
            self.game.save()
            
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
