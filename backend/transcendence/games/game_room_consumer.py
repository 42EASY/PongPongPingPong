import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import cache
from members.models import Members
from games.models import Game, Participant
from tournaments.models import TournamentGame, Tournament
from django.db.models import Count, Q
from games.distributed_lock import DistributedLock

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
        #TODO: disconnect 구현
        print(close_code)
        # await self.disconnect()


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

        key = 'tournament_' + str(self.room_id)

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
                'tournament_id': self.room_id
            })
        


    #방에 입장 후 게임 시작 대기
    async def join_room(self, text_data_json):
        key = "tournament_" + str(self.room_id)
        
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

        new_parsed_value = json.loads(new_value)

        #만일 4명이 방에 다 들어오면 방에 있는 모두에게 게임 시작 알림
        if (len(new_parsed_value["join_user"]) == 4):

            matching_value = []

            #등록된 유저의 정보와 승률을 list에 저장
            for player in registered_value:
                user_model = Members.objects.get(id = player["user_id"])
            
                game_stats = Participant.objects.filter(user_id=user_model).aggregate(
				    total_games=Count('id'),  # 'id' 필드를 기준으로 총 게임 수 집계
				    win_count=Count('id', filter=Q(result=Participant.Result.WIN)),  # 승리한 게임 수
			    )

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
            game1 = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)

            Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[0]["user_id"]), game_id = game1, score = 0, opponent_id = sorted_matching_value[1]["user_id"])
            Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[1]["user_id"]), game_id = game1, score = 0, opponent_id = sorted_matching_value[0]["user_id"])

            TournamentGame.objects.create(game_id = game1, tournament_id = self.tournament, round = TournamentGame.Round.SEMI_FINAL)

            game2 = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)

            Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[2]["user_id"]), game_id = game2, score = 0, opponent_id = sorted_matching_value[3]["user_id"])
            Participant.objects.create(user_id = Members.objects.get(id=sorted_matching_value[3]["user_id"]), game_id = game2, score = 0, opponent_id = sorted_matching_value[2]["user_id"])

            TournamentGame.objects.create(game_id = game2, tournament_id = self.tournament, round = TournamentGame.Round.SEMI_FINAL)

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

        key = "tournament_" + str(self.room_id)

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
                    user_model = Members.objects.get(id = player["user_id"])
            
                    game_stats = Participant.objects.filter(user_id=user_model).aggregate(
				        total_games=Count('id'),  # 'id' 필드를 기준으로 총 게임 수 집계
				        win_count=Count('id', filter=Q(result=Participant.Result.WIN)),  # 승리한 게임 수
			        )

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


            game = Game.objects.create(game_mode = Game.GameMode.TOURNAMENT)
            
            TournamentGame.objects.create(game_id = game, tournament_id = self.tournament, round = TournamentGame.Round.FINAL)

            Participant.objects.create(user_id = Members.objects.get(id = matching_value[0]["user_id"]), game_id = game, score = 0, opponent_id = matching_value[1]["user_id"])
            Participant.objects.create(user_id = Members.objects.get(id = matching_value[1]["user_id"]), game_id = game, score = 0, opponent_id = matching_value[0]["user_id"])


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
        