import json

from django.core.cache import cache
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from games.models import Game, Participant
from tournaments.models import Tournament
from members.models import Members
from games.distributed_lock import DistributedLock
from utils import bot_notify_process, get_member_info
from datetime import datetime, timezone
from channels.db import database_sync_to_async

prefix_normal = "normal_"
prefix_tournament = "tournament_"

class GameQueueConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):

        #TODO: group 활용하기
        self.game_group_id = "10"

        self.user = self.scope['user']
        
        self.key = "-1"

        self.lock = DistributedLock()
    
        await self.channel_layer.group_add(
            self.game_group_id, self.channel_name
        )
        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.game_group_id, self.channel_name
        )
        
        #TODO: 토너먼트인 경우 여기서 disconnect를 하고 room으로 넘어갈 경우 여기서 정보를 삭제해버리기 떄문에 오류 발생함

        #TODO: 일반적인 상황에서 disconnect가 되는 경우와, disconnect가 되면 안되는 상황에서 되는 경우(cancle_queue 메소드 불러오기)를 생각해서 구현하기
        
        
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        action = text_data_json["action"]

        if (action == "join_invite_normal_queue"):
            await self.join_invite_normal(text_data_json)
        elif (action == "invite_normal_queue"):
            await self.invite_normal(text_data_json)
        elif (action == "join_normal_queue"):
            await self.join_normal(text_data_json)
        elif (action == "join_invite_tournament_queue"):
            await self.join_invite_tournament(text_data_json)
        elif (action == "invite_tournament_queue"):
            await self.invite_tournament(text_data_json)
        elif (action == "join_tournament_queue"):
            await self.join_tournament(text_data_json)
        elif (action == "cancel_queue"):
            await self.cancel_queue()            

        else:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 action 입니다"
            })


    #tournament 빠른 시작일 경우
    async def join_tournament(self, text_data_json):

        keys = None
        if self.lock.acquire_lock():
            try:
                keys = cache.keys(prefix_tournament + '*')
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


        flag = False
        
        join_game_key = ""

        for key in keys:
            tournament_id = key[11:]

            #존재하지 않는 tournament_id이면 삭제
            tournaments = await self.get_tournaments(int(tournament_id))
            if (tournaments.exists() == False):
                cache.delete(key)
                continue

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
            registered_user = parsed_value["registered_user"]
            invited_info = parsed_value["invited_info"]


            #registered_user에 존재하지 않는 사용자가 있는지 확인
            idx = -1
            for user_json in registered_user:
                idx = idx + 1
                user_id = user_json["user_id"]

                members = await self.get_members(user_id)
                if (members.exists() == False):
                    parsed_value["registered_user"].pop(idx)

            
            #invisted_info에 존재하지 않는 사용자가 있는지 확인
            idx = -1
            for invite_user in invited_info:
                idx = idx + 1
                user_id = invite_user["user_id"]

                members = await self.get_members(user_id)
                if (members.exists() == False):
                    parsed_value["invited_info"].pop(idx)


            #정보 갱신하기
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

 
            #갱신 후 다시 값 가져오기
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
            new_invited_info = new_parsed_value["invited_info"]
            new_registered_info = new_parsed_value["registered_user"]

            #만일 등록된 유저가 4명이면 넘어가기
            if (len(new_registered_info) >= 4):
                continue

            
            new_parsed_value['registered_user'].append({
                "user_id": self.user.id,
                "channel_id": self.channel_name
            }) 

            new_updated_value = json.dumps(new_parsed_value)
                
            if self.lock.acquire_lock():
                try:
                    cache.set(key, new_updated_value)
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

                
            flag = True

            join_game_key = key[11:]
            break


        #flag == false면은 새롭게 토너먼트를 만들어서 redis에 저장
        if (flag == False):
            new_tournament = await self.create_tournament()
            new_tournament_value = {
                "registered_user": [{
                    "user_id" : self.user.id,
                    "channel_id": self.channel_name
                }],
                "invited_info": [],
                "join_user": [],
                "join_final_user": []
            }

            if self.lock.acquire_lock():
                try:
                    cache.set(prefix_tournament + str(new_tournament.id),  json.dumps(new_tournament_value))
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
            
            join_game_key = new_tournament.id

        self.key = prefix_tournament + str(join_game_key)

        await self.send_json({
                "status": "success",
                "room_id": join_game_key
            })


    #tournament 모드에서 초대를 하는 경우
    async def invite_tournament(self, text_data_json):
        invite_user_id = text_data_json["invite_user_id"]

        members = await self.get_members(invite_user_id)
        if (members.exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 invite user id 입니다"
            })
            return


        tournament = await self.create_tournament()

        value = {
            "registered_user": [{
                "user_id" : self.user.id,
                "channel_id": self.channel_name
            }],
            "invited_info": [{
                "user_id": invite_user_id,
            }],
            "join_user": [],
            "join_final_user": []
        }


        if self.lock.acquire_lock():
            try:
                cache.set(prefix_tournament + str(tournament.id),  json.dumps(value))
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
            
        self.key = prefix_tournament + str(tournament.id)

        await self.send_json({
                'status': 'game create success',
                'room_id': tournament.id
            })
        
        await self.notify_invite_tournament_game(invite_user_id, tournament.id)
        


    #tournament 모드에서 초대를 받는 경우
    async def join_invite_tournament(self, text_data_json):
        tournament_id = text_data_json["room_id"]

        tournaments = await self.get_tournaments(tournament_id)
        if (tournaments.exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 room_id 입니다"
            })
            return

        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get(prefix_tournament + str(tournament_id))
            except:
                self.lock.release_lock()
                await self.send_json({
                    "status": "fail",
                    "message": "존재하지 않는 게임입니다"
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
                "message": "존재하지 않는 게임입니다"
            })
            return
        
        parsed_value = json.loads(value)
        invited_info = parsed_value["invited_info"]
        registered_info = parsed_value["registered_user"]

        #registered_user에 존재하지 않는 사용자가 있는지 확인
        idx = -1
        for user_json in registered_info:
            idx = idx + 1
            user_id = user_json["user_id"]

            members = await self.get_members(user_id)
            if (members.exists() == False):
                parsed_value["registered_user"].pop(idx)


        #invisted_info에 존재하지 않는 사용자가 있는지 확인
        idx = -1
        for invite_user in invited_info:
            idx = idx + 1
            user_id = invite_user["user_id"]

            members = await self.get_members(user_id)
            if (members.exists() == False):
                parsed_value["invited_info"].pop(idx)

        #정보 갱신하기
        updated_value = json.dumps(parsed_value)
        if self.lock.acquire_lock():
            try:
                cache.set(prefix_tournament + str(tournament_id), updated_value)
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

        
        #갱신 후 값을 다시 가져옴
        new_value = None
        if self.lock.acquire_lock():
            try:
                new_value = cache.get(prefix_tournament + str(tournament_id))
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
        new_registered_user = new_parsed_value["registered_user"]
        new_invited_info = new_parsed_value["invited_info"]



        #이미 게임 인원이 다 차버린 경우
        if len(new_registered_user) == 4:
            await self.send_json({
                "status": "fail",
                "message": "인원이 다 찬 게임방입니다"
            })
            return

        #초대리스트에 아무도 없는 경우
        if len(new_invited_info) == 0:
            await self.send_json({
                "status": "fail",
                "message": "초대 내역이 없습니다"
            })
            return
        

        #초대리스트에 유저가 있는지 확인
        flag = False
        idx = -1
        user_idx = -1

        for tmp in new_invited_info:
            idx += 1
                
            if (tmp["user_id"] == self.user.id):
                user_idx = idx
                flag = True
                break
           
    

        #invited_info 안에 user_id가 없는 경우
        if (flag == False):
            #user_id가 없는 경우
            if (user_idx == -1):
                await self.send_json({
                    'status': 'fail',
                    'message': '초대 대상이 아닙니다'
                })
                return 
        
        new_parsed_value["registered_user"].append({
            "user_id": self.user.id,
            "channel_id": self.channel_name
        })

        new_updated_value = json.dumps(new_parsed_value)

        if self.lock.acquire_lock():
            try:
                cache.set(prefix_tournament + str(tournament_id), new_updated_value)
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

        self.key = prefix_tournament + str(tournament_id)

        await self.send_json({
            'status': "success"
        })


    #normal 모드 빠른시작
    async def join_normal(self, text_data_json):
        game_mode = text_data_json["game_mode"]

        keys = None
        if self.lock.acquire_lock():
            try:
                keys = cache.keys(prefix_normal + '*')
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

        flag = False
        
        join_game_key = ""

        for key in keys:
            game_id = key[7:]
            
            #존재하지 않는 game_id이면 삭제
            games = await self.get_games(int(game_id))
            if (games.exists() == False):
                cache.delete(key)
                continue
            
            game = await self.get_game(int(game_id))

            if (game.game_option.lower() != game_mode.lower()):
                continue

            
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
            registered_user = parsed_value["registered_user"]
            invited_info = parsed_value["invited_info"]

            
            #registered_user에 존재하지 않는 사용자가 있는지 확인
            idx = -1
            for user_json in registered_user:
                idx = idx + 1
                user_id = user_json["user_id"]

                members = await self.get_members(user_id)
                if (members.exists() == False):
                    parsed_value["registered_user"].pop(idx)

            
            #invited_info에 존재하지 않는 사용자가 있는지 확인
            idx = -1
            for invite_user in invited_info:
                idx = idx + 1
                user_id = invite_user["user_id"]

                members = await self.get_members(user_id)
                if (members.exists() == False):
                    parsed_value["invited_info"].pop(idx)

            #정보 갱신하기
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


            #갱신 후 값을 다시 가져옴
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
            new_registered_user = new_parsed_value["registered_user"]
            new_invited_info = new_parsed_value["invited_info"]


            #만일 초대리스트에 값이 있거나, 등록된 유저가 2명이면 넘어가기
            if (len(new_invited_info) >= 1 or len(new_registered_user) >= 2):
                continue

            #만일 본인이 있으면 넘어가기
            user_flag = False
            for register in new_registered_user:
                if (register["user_id"] == self.user.id):
                    user_flag = True
                    continue
            if (user_flag == True):
                continue


            new_parsed_value['registered_user'].append({
                "user_id": self.user.id,
                "channel_id": self.channel_name
            }) 
                
            new_updated_value = json.dumps(new_parsed_value)


            if self.lock.acquire_lock():
                try:
                    cache.set(key, new_updated_value)
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
                
            flag = True

            join_game_key = key

            try:
                user1 = await self.get_member(new_parsed_value['registered_user'][0]['user_id'])
                user2 = await self.get_member(new_parsed_value['registered_user'][1]['user_id'])

                await self.create_participant(user1, user2.id, game)
                await self.create_participant(user2, user1.id, game)

            except:
                await self.send_json({
                    "status": "fail",
                    "message": "db에서 오류가 발생했습니다"
                })
                return
                
            break

        
        #만일 flag == true면은 이미 있는 게임에 있는 사람 모두에게 게임 시작 알림
        if (flag == True):
            result_value = None
            if self.lock.acquire_lock():
                try:
                    result_value = cache.get(join_game_key)
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
            
            json_result_value = result_value.encode('utf-8')
            parsed_result_value = json.loads(json_result_value)

            registered_result_users = parsed_result_value["registered_user"]

            user_info_data = []

            for user_info in registered_result_users:
                id = user_info["user_id"]

                try:
                    user = await self.get_member(id)
                except:
                    await self.send_json({
                        "status": "fail",
                        "message": "db에서 오류가 발생했습니다"
                    })
                    return


                data = {
                    "user_id": id,
                    "nickname": user.nickname,
                    "image_url": user.image_url
                }
                user_info_data.append(data)

            self.key = join_game_key

            for user_info in registered_result_users:
                         
                await self.channel_layer.send(
                    user_info["channel_id"],
                    {
                        'type': 'broadcast_game_start',
                        'game_id': join_game_key[7:],
                        'player_info': user_info_data
                    })

        #flag == false면은 새롭게 게임을 만들어서 redis에 저장
        else:
            new_game = await self.create_game(game_mode, Game.GameMode.NORMAL)
            new_game_value = {
                "registered_user": [{
                    "user_id" : self.user.id,
                    "channel_id": self.channel_name
                }],
                "invited_info": []
            }



            if self.lock.acquire_lock():
                try:
                    cache.set(prefix_normal + str(new_game.id),  json.dumps(new_game_value))
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
           
            self.key = prefix_normal + str(new_game.id)




    #normal 모드에서 초대를 한 경우
    async def invite_normal(self, text_data_json):
        game_mode = text_data_json["game_mode"]
        invite_user_id = text_data_json["invite_user_id"]

        members = await self.get_members(invite_user_id)
        if (members.exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 invite user id 입니다"
            })
            return

        game = await self.create_game(game_mode, Game.GameMode.NORMAL)
        
        value = {
            "registered_user": [{
                "user_id" : self.user.id,
                "channel_id": self.channel_name
            }],
            "invited_info": [{
                "user_id": invite_user_id,
            }]
        }


        if self.lock.acquire_lock():
            try:
                cache.set(prefix_normal + str(game.id),  json.dumps(value))
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
        

        
        self.key = prefix_normal + str(game.id)

        await self.send_json({
                'status': 'game create success',
                'game_id': game.id
            })
        
        await self.notify_invite_normal_game(invite_user_id, game.id, game_mode)


    #normal 모드에서 초대를 받은 경우
    async def join_invite_normal(self, text_data_json):
        game_id = text_data_json["game_id"]

        games = await self.get_games(game_id)
        if (games.exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 game id 입니다"
            })

        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get(prefix_normal + str(game_id))
            except:
                self.lock.release_lock()
                await self.send_json({
                    "status": "fail",
                    "message": "존재하지 않는 게임입니다"
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
                'status': 'fail',
                'message': '존재하지 않는 게임입니다'
            })
            return
    

        parsed_value = json.loads(value)
        registered_user = parsed_value["registered_user"]
        invited_info = parsed_value["invited_info"]

        #registered_user에 존재하지 않는 사용자가 있는지 확인
        idx = -1
        for user_json in registered_user:
            idx = idx + 1
            user_id = user_json["user_id"]

            members = await self.get_members(user_id)
            if (members.exists() == False):
                parsed_value["registered_user"].pop(idx)

        #invited_info에 존재하지 않는 사용자가 있는지 확인
        idx = -1
        for invite_user in invited_info:
            idx = idx + 1
            user_id = invite_user["user_id"]

            members = await self.get_members(user_id)
            if (members.exists() == False):
                parsed_value["invited_info"].pop(idx)

        #정보 갱신하기
        updated_value = json.dumps(parsed_value)
        if self.lock.acquire_lock():
            try:
                cache.set(prefix_normal + str(game_id), updated_value)
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


        #갱신 후 값을 다시 가져옴
        new_value = None
        if self.lock.acquire_lock():
            try:
                new_value = cache.get(prefix_normal + str(game_id))
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
        new_registered_user = new_parsed_value["registered_user"]
        new_invited_info = new_parsed_value["invited_info"]
    
        #초대리스트에 아무도 없는 경우
        if len(new_invited_info) == 0:
            await self.send_json({
                'status': 'fail',
                'message': '초대 내역이 없습니다'
            })
            return
            
        #초대리스트에 등록된 유저가 아닌 경우
        if (new_invited_info[0]["user_id"] != self.user.id):
            await self.send_json({
                'status': 'fail',
                'message': '초대 대상이 아닙니다'
            })
            return
        
        #registered_user에 아무도 없는 경우
        if (len(new_registered_user) == 0):
            await self.send_json({
                'status': 'fail',
                'message': '게임에 참여할 수 없습니다'
            })
            return

        #invited_info안의 유저 정보 제거 후, 게임 대기 큐에 등록
        new_parsed_value["invited_info"].pop(0)
        new_parsed_value['registered_user'].append({
            "user_id": self.user.id,
            "channel_id": self.channel_name
        }) 

        new_updated_value = json.dumps(new_parsed_value)
        
    
        if self.lock.acquire_lock():
            try:
                cache.set(prefix_normal + str(game_id), new_updated_value)
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

        try:
            
            opponent_user = await self.get_member(int(new_parsed_value['registered_user'][0]["user_id"]))
            game = await self.get_game(game_id)

            await self.create_participant(opponent_user, self.user.id, game)
            await self.create_participant(self.user, opponent_user.id, game)

        except:
            await self.send_json({
                "status": "fail",
                "message": "db에서 오류가 발생했습니다"
            })
            return

        #게임 시작할 것이라는 response를 모두에게 전달
        new_value = None
        if self.lock.acquire_lock():
            try:
                new_value = cache.get(prefix_normal + str(game_id))
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

        json_new_value = new_value.encode('utf-8')
        parsed_new_value = json.loads(json_new_value)

        registered_users = parsed_new_value["registered_user"]
            
        player_info = []

        for user_info in registered_users:
            id = user_info["user_id"]

            try:
                user = await self.get_member(id)
            except:
                await self.send_json({
                    "status": "fail",
                    "message": "db에서 오류가 발생했습니다"
                })
                return

            data = {
                "user_id": id,
                "nickname": user.nickname,
                "image_url": user.image_url
            }
            player_info.append(data)


        for user_info in registered_users:
                         
            await self.channel_layer.send(
                user_info["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game_id,
                    'player_info': player_info
                })
            
        self.key = prefix_normal + str(game_id)
    

    #normal 빠른시작, normal 초대 후 대기 action 이후 취소하는 경우
    async def cancel_queue(self):
        #의도치 않는 disconnect인지 검사
        if (self.key == "-1") :
            return
        
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

        #노말이면, 그냥 redis 삭제
        if (self.key[0] == 'n'):
            cache.delete(self.key)

        #토너먼트면 혼자 있는 경우에는 redis 삭제, 2명 이상 부터는 registered_user에서 pop
        elif (self.key[0] == 't'):
            parsed_value = json.loads(value)
            registered_info = parsed_value["registered_user"]

            #혼자 있는 경우에는 redis 삭제
            if (len(registered_info) == 1):
                cache.delete(self.key)
            else :
                idx = -1
                for info in registered_info:
                    idx = idx + 1
                    if (info["user_id"] == self.user.id):
                        parsed_value["registered_user"].pop(idx)

                    
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



    async def broadcast_game_start(self, event):
        game_id = event["game_id"]
        player_info = event["player_info"]

        await self.send_json({
            "status": "game_start_soon",
            "game_id": game_id,
            "player_info": player_info
        })

    async def notify_invite_normal_game(self, user_id, game_id, mode):
        inviter = await get_member_info(self.user.id)
        data = {
            "game_id":game_id,
            "mode":mode,
            "inviter": inviter
        }
        await bot_notify_process(self, user_id, "bot_notify_invited_normal_game", data)

    async def notify_invite_tournament_game(self, user_id, room_id):
        inviter = await get_member_info(self.user.id)
        data = {
            "room_id":room_id,
            "inviter": inviter
        }
        await bot_notify_process(self, user_id, "bot_notify_invited_tournament_game", data)


    @database_sync_to_async
    def get_game(self, game_id):
        return Game.objects.get(id = game_id)
    
    @database_sync_to_async
    def get_member(self, user_id):
        return Members.objects.get(id = user_id)

    @database_sync_to_async
    def get_tournaments(self, tournament_id):
        return Tournament.objects.filter(id = tournament_id)
    
    @database_sync_to_async
    def get_members(self, user_id):
        return Members.objects.filter(id = user_id)
    
    @database_sync_to_async
    def get_games(self, game_id):
        return Game.objects.filter(id = game_id)
    
    @database_sync_to_async
    def create_tournament(self):
        return Tournament.objects.create()
    
    @database_sync_to_async
    def create_participant(self, user_id, opponent_id, game_id):
        return Participant.objects.create(user_id = user_id, opponent_id = opponent_id, game_id = game_id, score = 0)

    @database_sync_to_async
    def create_game(self, game_option, game_mode):
        game_time = datetime.now(timezone.utc)
        return Game.objects.create(game_option = game_option, game_mode = game_mode, start_time = game_time, end_time = game_time)
            