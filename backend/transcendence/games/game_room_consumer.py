import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import cache
from members.models import Members
from games.models import Game, Participant
from tournaments.models import TournamentGame, Tournament
from django.db.models import Count, Q
from games.distributed_lock import DistributedLock
from utils import get_member_info, bot_notify_process
import time
from datetime import datetime, timezone
from channels.db import database_sync_to_async

prefix_normal = "normal_"
prefix_tournament = "tournament_"

class GameRoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        path = self.scope['path']
        self.room_id = path.strip('/').split('/')[-1]
        self.user = self.scope['user']
        self.lock = DistributedLock()

        try:
            self.tournament = await self.get_tournament(self.room_id)
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
            
            #게임 결과 방송

            opponent_channel_name = "-1"

            for info in registered_info:
                if (parsed_value["join_final_user"][0] == info['user_id']):
                    opponent_channel_name = info["channel_id"] 

            await self.channel_layer.send(
                opponent_channel_name,
                {
                    'type': 'broadcast_game_status',
                    'message': 'game_over',
                    'game_status': [{ "user_id" : self.user.id, "score": user_participants.score }, 
                                { "user_id" : opponent.id, "score" : opponent_participants.score}]
                })


        else:
            #redis값 갱신
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


        #남아있는 사람들에게 유저 info 방송
        #TODO: 함수로 나누기
        new_value = None
        if self.lock.acquire_lock():
            try:
                new_value = cache.get(prefix_tournament + self.room_id)
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
        
        #플레이어 info 가져오기
        new_parsed_value = json.loads(new_value)
        new_registered_user = new_parsed_value["registered_user"]
        new_join_user = new_parsed_value["join_user"]
        
        try:
            player_entrance_info = []

            for user_id in new_join_user:
                user_model = await self.get_member(int(user_id))

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
        registered_value = parsed_value["registered_user"]
        
        flag = False
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
                user_model = await self.get_member(int(user_id))
 
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

            matching_value = []

            #등록된 유저의 정보와 승률을 list에 저장
            for player in registered_value:
                try:
                    user_model = await self.get_member(player['user_id'])
 
                    game_stats = await self.get_participants_by_aggregate(user_model)
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
                game1 = await self.create_game(Game.GameMode.TOURNAMENT)

                user1 = await self.get_member(sorted_matching_value[0]["user_id"])
                user2 = await self.get_member(sorted_matching_value[1]["user_id"])

                await self.create_participant(user1, game1, sorted_matching_value[1]["user_id"])
                await self.create_participant(user2, game1, sorted_matching_value[0]["user_id"])

                await self.create_tournament_game(game1, self.tournament, TournamentGame.Round.SEMI_FINAL)

                #승률을 기준으로 정렬한 sorted_matching_value[2]과 sorted_matching_value[3]이 서로 한 게임을 하도록 game, participant, tournament 테이블 생성
                game2 = await self.create_game(Game.GameMode.TOURNAMENT)

                user3 = await self.get_member(sorted_matching_value[2]["user_id"])
                user4 = await self.get_member(sorted_matching_value[3]["user_id"])

                await self.create_participant(user3, game2, sorted_matching_value[3]["user_id"])
                await self.create_participant(user4, game2, sorted_matching_value[2]["user_id"])

                await self.create_tournament_game(game2, self.tournament, TournamentGame.Round.SEMI_FINAL)

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
                    'status': 'semi_final_game_start_soon',
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
                    'status': 'semi_final_game_start_soon',
                    'game_id': game1.id,
                    'player_info': {
                        "user_id": sorted_matching_value[0]["user_id"],
                        "image_url": sorted_matching_value[0]["image_url"],
                        "nickname": sorted_matching_value[0]["nickname"]
                    }
                })

            await self.notify_tournament_game_opponent(game1.id, sorted_matching_value[0]["user_id"], sorted_matching_value[1]["user_id"])
            await self.notify_tournament_game_opponent(game1.id, sorted_matching_value[1]["user_id"], sorted_matching_value[0]["user_id"])

            #인덱스 2에게 정보 알리기
            await self.channel_layer.send(
                sorted_matching_value[2]["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'status': 'semi_final_game_start_soon',
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
                    'status': 'semi_final_game_start_soon',
                    'game_id': game2.id,
                    'player_info': {
                        "user_id": sorted_matching_value[2]["user_id"],
                        "image_url": sorted_matching_value[2]["image_url"],
                        "nickname": sorted_matching_value[2]["nickname"]
                    }
                })

            await self.notify_tournament_game_opponent(game2.id, sorted_matching_value[2]["user_id"], sorted_matching_value[3]["user_id"])
            await self.notify_tournament_game_opponent(game2.id, sorted_matching_value[3]["user_id"], sorted_matching_value[2]["user_id"])


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
        registered_value = parsed_value["registered_user"]
        
        flag = False
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
                        user_model = await self.get_member(player['user_id'])

                        game_stats = await self.get_participants_by_aggregate(user_model)
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
                game = await self.create_game(Game.GameMode.TOURNAMENT)
                
                await self.create_tournament_game(game, self.tournament, TournamentGame.Round.FINAL)

                user1 = await self.get_member(matching_value[0]["user_id"])
                user2 = await self.get_member(matching_value[1]["user_id"])

                await self.create_participant(user1, game, matching_value[1]["user_id"])
                await self.create_participant(user2, game, matching_value[0]["user_id"])
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
                    'status': 'final_game_start_soon',
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
                    'status': 'final_game_start_soon',
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
        status = event["status"]

        await self.send_json({
            "status": status,
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

     #game status 알림
    async def broadcast_game_status(self, event):

        await self.send_json({
            "status": event["message"],
            "game_status": event["game_status"]
        })

        
    async def notify_tournament_game_opponent(self, game_id, user_id, opponent_id):
        opponent = await get_member_info(opponent_id)
        data = {
            "game_id": game_id,
            "opponent": opponent
        }
        await bot_notify_process(self, user_id, "bot_notify_tournament_game_opponent", data)

    @database_sync_to_async
    def get_game(self, game_id):
        return Game.objects.get(id = game_id)

    @database_sync_to_async
    def get_participant_by_game(self, user_id, opponent_id, game_ids):
        return Participant.objects.get(user_id = user_id, opponent_id = opponent_id, game_id__in = game_ids)

    @database_sync_to_async
    def get_tournament(self, tournament_id):
        return Tournament.objects.get(id = tournament_id)
    
    @database_sync_to_async
    def get_member(self, user_id):
        return Members.objects.get(id = user_id)
    
    @database_sync_to_async
    def get_participants_by_aggregate(self, user_id):
        return Participant.objects.filter(user_id = user_id).aggregate(
				        total_games=Count('id'),  # 'id' 필드를 기준으로 총 게임 수 집계
				        win_count=Count('id', filter=Q(result=Participant.Result.WIN)),  # 승리한 게임 수
			        )

    @database_sync_to_async
    def get_tournament_games(self, tournament_id):
        return TournamentGame.objects.filter(tournament_id = tournament_id)
    
    @database_sync_to_async
    def create_game(self, game_mode):
        game_time = datetime.now(timezone.utc)
        return Game.objects.create(game_mode = game_mode, start_time = game_time, end_time = game_time)
            
    @database_sync_to_async
    def create_tournament_game(self, game_id, tournament_id, round):
        return TournamentGame.objects.create(game_id = game_id, tournament_id = tournament_id, round = round)
    
    @database_sync_to_async
    def create_participant_result(self, user_id, game_id, opponent_id, result):
        return Participant.objects.create(user_id = user_id, opponent_id = opponent_id, game_id = game_id, score = 0, result = result)
    
    @database_sync_to_async
    def create_participant(self, user_id, game_id, opponent_id):
        return Participant.objects.create(user_id = user_id, opponent_id = opponent_id, game_id = game_id, score = 0)
    

    @database_sync_to_async
    def update_game(self, game):
        game.save()
    
    @database_sync_to_async
    def update_participant(self, participant):
        participant.save()