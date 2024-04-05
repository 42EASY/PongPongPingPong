import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import cache
from members.models import Members
from games.models import Game, Participant
from tournaments.models import TournamentGame, Tournament
from django.db.models import Count, Q
from games.distributed_lock import DistributedLock
import time

prefix_normal = "normal_"
prefix_tournament = "tournament_"

class GameRoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        path = self.scope['path']
        self.room_id = path.strip('/').split('/')[-1]
        self.user = self.scope['user']
        self.lock = DistributedLock()

        try:
            self.tournament = Tournament.objects.get(id = self.room_id)
        except:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 room_id 입니다"
            })
            return 

        await self.accept()

    async def disconnect(self, close_code):

        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get(prefix_tournament + self.room_id)
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

        #redis에 있는 값에서 user정보 제거

        parsed_value = json.loads(value)
        registered_info = parsed_value["registered_user"]
        join_info = parsed_value["join_user"]
        join_final_info = parsed_value["join_final_user"]

        #registered_user 값 제거
        idx = -1
        for info in registered_info:
            idx = idx + 1
            if (info["user_id"] == int(self.user.id)):
                parsed_value["registered_user"].pop(idx)

        #join_user 값 제거
        idx = -1
        for info in join_info:
            idx = idx + 1
            if (info == int(self.user.id)):
                parsed_value["join_user"].pop(idx)
        
        #join_final_user 값 제거
        idx = -1
        flag = False
        for info in join_final_info:
            idx = idx + 1
            if (info == int(self.user.id)):
                parsed_value["join_final_user"].pop(idx)
                flag = True
            
        #만일 결승 진행중에 disconnect가 된 거면, 게임 종료 처리 
        if (flag == True):
            try:
                opponent = Members.objects.get(id = parsed_value["join_final_user"][0])
                
                #결승에 대한 게임 db가 만들어져있지 않다면 새롭게 만들어서 승패 처리
                if (len(TournamentGame.objects.filter(tournament_id = self.tournament)) < 3):
                    game = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)
            
                    TournamentGame.objects.create(game_id = game, tournament_id = self.tournament, round = TournamentGame.Round.FINAL)

                    Participant.objects.create(user_id = self.user.id, game_id = game, score = 0, opponent_id = opponent.id, result = Participant.Result.LOSE)
                    Participant.objects.create(user_id = opponent.id, game_id = game, score = 0, opponent_id = self.user.id, result = Participant.Result.WIN)

                #결승에 대한 게임 db가 있으면 승패 업데이트
                else:
                    game_ids = TournamentGame.objects.filter(tournament_id = self.tournament).values_list('game_id', flat = True)
                    
                    # 가져온 game_id 리스트를 이용하여 Participant 모델에서 해당하는 레코드들을 필터
        
                    user_participants = Participant.objects.get(user_id = self.user, opponent_id = opponent.id, game_id__in = game_ids)
                    opponent_participants = Participant.objects.get(user_id = opponent, opponent_id = self.user.id, game_id__in = game_ids)
            
                    user_participants.result = Participant.Result.LOSE
                    opponent_participants.result = Participant.Result.WIN

                    user_participants.save()
                    opponent_participants.save()
                    
            except:
                await self.send_json({
                    "status": "fail",
                    "message": "db에 접근 중 오류가 발생했습니다"
                })
                return
            
            #redis 값 삭제
            if self.lock.acquire_lock():
                try:
                    cache.delete(prefix_tournament + self.room_id)
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

        #redis값 갱신
        else:
            updated_value = json.dumps(parsed_value)
            if self.lock.acquire_lock():
                try:
                    cache.set(prefix_tournament + self.room_id, updated_value)
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


        #TODO: 게임 결과 방송
        

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        action = text_data_json["action"]

        if (action == "join_room"):
            await self.join_room(text_data_json)
        elif (action == "invite_room"):
            await self.invite_room(text_data_json)
        elif (action == "join_final"):
            await self.join_final(text_data_json)
        else:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 action 입니다"
            })

    #초대를 하는 경우
    async def invite_room(self, text_data_json):
        invite_user_id = text_data_json["invite_user_id"]

        key = prefix_tournament + str(self.room_id)

        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get(key)
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

        parsed_value["invited_info"].append({"user_id": invite_user_id})

        if self.lock.acquire_lock():
            try:
                cache.set(key, json.dumps(parsed_value))
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
        
        
        await self.send_json({
                'status': 'invitation list registered',
                'room_id': self.room_id
            })
        


    #방에 입장 후 게임 시작 대기
    async def join_room(self, text_data_json):
        key = prefix_tournament + str(self.room_id)
        
        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get(key)
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

        

        #redis에 key 또는 value가 없는 경우
        if (value is None):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 room_id 입니다"
            })
            return
        
        parsed_value = json.loads(value)

        #registered 되어있는 유저인지 확인
        registered_value = parsed_value["registered_user"];
        
        flag = False;
        idx = -1
        for user_value in registered_value:
            idx += 1
            if (user_value["user_id"] == self.user.id):
                #channel_id 갱신
                #TODO: 추후에 registered_user에 channel_id를 갱신하는 것이 아니라, join_user에 channel_name 저장하도록 하기
                parsed_value["registered_user"][idx]["channel_id"] = self.channel_name
                flag = True
                break

        if (flag == False):
            await self.send_json({
                "status": "fail",
                "message": "등록되지 않은 유저입니다"
            })
            return


        #join_user에 유저 등록
        parsed_value["join_user"].append(self.user.id)

        updated_value = json.dumps(parsed_value)

        if self.lock.acquire_lock():
            try:
                cache.set(key, updated_value)
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


        new_value = None
        if self.lock.acquire_lock():
            try:
                new_value = cache.get(key)
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

        #한명씩 들어올 때마다 이미 registered 되어있는 사람들한테 유저 정보 뿌리기
        
        #플레이어 info 가져오기
        new_parsed_value = json.loads(new_value)
        new_registered_user = new_parsed_value["registered_user"]
        new_join_user = new_parsed_value["join_user"]
        
        try:
            player_entrance_info = []

            for user_id in new_join_user:
                user_model = Members.objects.get(id = int(user_id))

                player_info = {
                    "user_id": user_id,
                    "image_url": user_model.image_url,
                    "nickname": user_model.nickname
                }

                player_entrance_info.append(player_info)
        except:
            await self.send_json({
                "status": "fail",
                "message": "db 접근 중 오류가 발생했습니다"
            })
            return


        #방에 이미 입장해있는 사람들한테 정보 방송하기
        for user_id in new_join_user:
            
            for user_value in new_registered_user:
                
                if (user_value["user_id"] == user_id):
                    await self.channel_layer.send(
                        user_value["channel_id"],
                        {
                            'type': 'broadcast_player_entrance',
                            'player_info': player_entrance_info
                        })


        #만일 4명이 방에 다 들어오면 방에 있는 모두에게 게임 시작 알림
        if (len(new_parsed_value["join_user"]) == 4):
            #잠시 5초동안 정지
            time.sleep(5)

            matching_value = []

            #등록된 유저의 정보와 승률을 list에 저장
            for player in registered_value:
                try:
                    user_model = Members.objects.get(id = player["user_id"])
                
                    game_stats = Participant.objects.filter(user_id=user_model).aggregate(
				        total_games=Count('id'),  # 'id' 필드를 기준으로 총 게임 수 집계
				        win_count=Count('id', filter=Q(result=Participant.Result.WIN)),  # 승리한 게임 수
			        )
                except:
                    await self.send_json({
                        "status": "fail",
                        "message": "db에서 오류가 발생했습니다"
                    })
                    return

                total_games = game_stats['total_games']
                win_count = game_stats['win_count']

                if total_games == 0:
                    win_rate = 0
                else:
                    win_rate = win_count / total_games
                
                player_info_json = {
                    "win_rate": win_rate,
                    "user_id": player["user_id"],
                    "channel_id": player["channel_id"],
                    "nickname": user_model.nickname,
                    "image_url": user_model.image_url
                }

                matching_value.append(player_info_json)

            #승률을 기준으로 정렬
            sorted_matching_value = sorted(matching_value, key=lambda x: x['win_rate'], reverse=True)


            #game과 participant, tournamentgame 생성
            try:
                #승률을 기준으로 정렬한 sorted_matching_value[0]과 sorted_matching_value[1]이 서로 한 게임을 하도록 game, participant, tournament 테이블 생성
                game1 = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)

                Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[0]["user_id"]), game_id = game1, score = 0, opponent_id = sorted_matching_value[1]["user_id"])
                Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[1]["user_id"]), game_id = game1, score = 0, opponent_id = sorted_matching_value[0]["user_id"])

                TournamentGame.objects.create(game_id = game1, tournament_id = self.tournament, round = TournamentGame.Round.SEMI_FINAL)

                #승률을 기준으로 정렬한 sorted_matching_value[2]과 sorted_matching_value[3]이 서로 한 게임을 하도록 game, participant, tournament 테이블 생성
                game2 = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)

                Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[2]["user_id"]), game_id = game2, score = 0, opponent_id = sorted_matching_value[3]["user_id"])
                Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[3]["user_id"]), game_id = game2, score = 0, opponent_id = sorted_matching_value[2]["user_id"])

                TournamentGame.objects.create(game_id = game2, tournament_id = self.tournament, round = TournamentGame.Round.SEMI_FINAL)
            except:
                await self.send_json({
                    "status": "fail",
                    "message": "db에서 오류가 발생했습니다"
                })
                return

            #인덱스 0 - 1이 한 게임, 2 - 3이 한 게임을 하도록 알림
            
            #인덱스 0에게 정보 알리기
            await self.channel_layer.send(
                sorted_matching_value[0]["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game1.id,
                    'player_info': {
                        "user_id": sorted_matching_value[1]["user_id"],
                        "image_url": sorted_matching_value[1]["image_url"],
                        "nickname": sorted_matching_value[1]["nickname"]
                    }
                })


            #인덱스 1에게 정보 알리기
            await self.channel_layer.send(
                sorted_matching_value[1]["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game1.id,
                    'player_info': {
                        "user_id": sorted_matching_value[0]["user_id"],
                        "image_url": sorted_matching_value[0]["image_url"],
                        "nickname": sorted_matching_value[0]["nickname"]
                    }
                })


            #인덱스 2에게 정보 알리기
            await self.channel_layer.send(
                sorted_matching_value[2]["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game2.id,
                    'player_info': {
                        "user_id": sorted_matching_value[3]["user_id"],
                        "image_url": sorted_matching_value[3]["image_url"],
                        "nickname": sorted_matching_value[3]["nickname"]
                    }
                })
            
            #인덱스 3에게 정보 알리기
            await self.channel_layer.send(
                sorted_matching_value[3]["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game2.id,
                    'player_info': {
                        "user_id": sorted_matching_value[2]["user_id"],
                        "image_url": sorted_matching_value[2]["image_url"],
                        "nickname": sorted_matching_value[2]["nickname"]
                    }
                })
        


    #결승 게임 시작 대기
    async def join_final(self, text_data_json):

        key = prefix_tournament + str(self.room_id)

        if self.lock.acquire_lock():
            try:
                value = cache.get(key)
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

        #redis에 key 또는 value가 없는 경우
        if (value is None):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 room_id 입니다"
            })
            return
        
        parsed_value = json.loads(value)

        #registered 되어있는 유저인지 확인
        registered_value = parsed_value["registered_user"];
        
        flag = False;
        idx = -1
        for user_value in registered_value:
            idx += 1
            if (user_value["user_id"] == self.user.id):
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


        #join_user에 유저 등록
        parsed_value["join_final_user"].append(self.user.id)

        updated_value = json.dumps(parsed_value)

        if self.lock.acquire_lock():
            try:
                cache.set(key, updated_value)
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


        new_value = None
        if self.lock.acquire_lock():
            try:
                new_value = cache.get(key)
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


        new_parsed_value = json.loads(new_value)

        #만일 2명이 방에 다 들어오면 방에 있는 모두에게 게임 시작 알림
        if (len(new_parsed_value["join_final_user"]) == 2):
            matching_value = []

            #등록된 유저의 정보와 승률을 list에 저장
            for player in registered_value:
                if (player["user_id"] in new_parsed_value["join_final_user"]):
                    try:
                        user_model = Members.objects.get(id = player["user_id"])
            
                        game_stats = Participant.objects.filter(user_id=user_model).aggregate(
				            total_games=Count('id'),  # 'id' 필드를 기준으로 총 게임 수 집계
				            win_count=Count('id', filter=Q(result=Participant.Result.WIN)),  # 승리한 게임 수
			            )
                    except:
                        await self.send_json({
                            "status": "fail",
                            "message": "db에서 오류가 발생했습니다"
                        })
                        return

                    total_games = game_stats['total_games']
                    win_count = game_stats['win_count']

                    if total_games == 0:
                        win_rate = 0
                    else:
                        win_rate = win_count / total_games
                
                    player_info_json = {
                        "win_rate": win_rate,
                        "user_id": player["user_id"],
                        "channel_id": player["channel_id"],
                        "nickname": user_model.nickname,
                        "image_url": user_model.image_url
                    }

                    matching_value.append(player_info_json)


            try:
                game = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)
            
                TournamentGame.objects.create(game_id = game, tournament_id = self.tournament, round = TournamentGame.Round.FINAL)

                Participant.objects.create(user_id = Members.objects.get(id = matching_value[0]["user_id"]), game_id = game, score = 0, opponent_id = matching_value[1]["user_id"])
                Participant.objects.create(user_id = Members.objects.get(id = matching_value[1]["user_id"]), game_id = game, score = 0, opponent_id = matching_value[0]["user_id"])
            except:
                await self.send_json({
                    "status": "fail",
                    "message": "db에서 오류가 발생했습니다"
                })
                return

            #인덱스 0에게 정보 알리기
            await self.channel_layer.send(
                matching_value[0]["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game.id,
                    'player_info': {
                        "user_id": matching_value[1]["user_id"],
                        "image_url": matching_value[1]["image_url"],
                        "nickname": matching_value[1]["nickname"]
                    }
                })


            #인덱스 1에게 정보 알리기
            await self.channel_layer.send(
                matching_value[1]["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game.id,
                    'player_info': {
                        "user_id": matching_value[0]["user_id"],
                        "image_url": matching_value[0]["image_url"],
                        "nickname": matching_value[0]["nickname"]
                    }
                })
        

    #게임 시작 방송
    async def broadcast_game_start(self, event):
        game_id = event["game_id"]
        player_info = event["player_info"]

        await self.send_json({
            "status": "game_start_soon",
            "game_id": game_id,
            "player_info": player_info
        })

    #플레이어 입장 방송
    async def broadcast_player_entrance(self, event):
        player_info = event["player_info"]

        await self.send_json({
            "status": "player_entrance",
            "player_info": player_info
        })
        