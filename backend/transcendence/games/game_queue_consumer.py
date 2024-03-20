import json

from django.core.cache import cache
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from games.models import Game, Participant
from tournaments.models import Tournament
from members.models import Members
from games.distributed_lock import DistributedLock

#TODO: registered 꽉 차면 삭제하는 로직 검증하기
class GameQueueConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):

        self.game_group_id = "10"

        self.lock = DistributedLock()
    
        await self.channel_layer.group_add(
            self.game_group_id, self.channel_name
        )
        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.game_group_id, self.channel_name
        )

    
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

        else:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 action 입니다"
            })


    #tournament 빠른 시작일 경우
    async def join_tournament(self, text_data_json):
        user_id = text_data_json["user_id"]
        current_time = text_data_json["current_time"]

        if (Members.objects.filter(id = user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 user id 입니다"
            })
            return

        keys = None
        if self.lock.acquire_lock():
            try:
                keys = cache.keys('tournament_*')
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
 
            #invite_info에 값이 있는지 확인
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

            #만일 값이 없다면 대기리스트에 등록
            if (len(new_registered_info) < 4 and len(new_invited_info) == 0):
                new_parsed_value['registered_user'].append({
                    "user_id": user_id,
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
            new_tournament = Tournament.objects.create()
            new_tournament_value = {
                "registered_user": [{
                    "user_id" : user_id,
                    "channel_id": self.channel_name
                }],
                "invited_info": [],
                "join_user": [],
                "join_final_user": []
            }

            if self.lock.acquire_lock():
                try:
                    cache.set('tournament_' + str(new_tournament.id),  json.dumps(new_tournament_value))
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


        await self.send_json({
                "status": "success",
                "tournament_id": join_game_key
            })


    #tournament 모드에서 초대를 하는 경우
    async def invite_tournament(self, text_data_json):
        user_id = text_data_json["user_id"]
        invite_user_id = text_data_json["invite_user_id"]
        invite_time = text_data_json["invite_time"]

        if (Members.objects.filter(id = user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 user id 입니다"
            })
            return

        if (Members.objects.filter(id = invite_user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 invite user id 입니다"
            })
            return


        tournament = Tournament.objects.create()

        value = {
            "registered_user": [{
                "user_id" : user_id,
                "channel_id": self.channel_name
            }],
            "invited_info": [{
                "user_id": invite_user_id,
                "invited_time": invite_time
            }],
            "join_user": [],
            "join_final_user": []
        }


        if self.lock.acquire_lock():
            try:
                cache.set('tournament_' + str(tournament.id),  json.dumps(value))
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
                'status': 'game create success',
                'tournament_id': tournament.id
            })
        


    #tournament 모드에서 초대를 받는 경우
    async def join_invite_tournament(self, text_data_json):
        tournament_id = text_data_json["tournament_id"]
        accept_time = text_data_json["accept_time"]
        user_id = text_data_json["user_id"]

        if (Members.objects.filter(id = user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 user id 입니다"
            })
            return
        
        if (Tournament.objects.filter(id = tournament_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 tournament id 입니다"
            })
            return

        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get("tournament_" + str(tournament_id))
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
                "message": "잘못된 tournament_id 입니다"
            })
            return
        
        parsed_value = json.loads(value)
        invited_info = parsed_value["invited_info"]
        registered_info = parsed_value["registered_user"]

        #이미 게임 인원이 다 차버린 경우
        if len(registered_info) == 4:
            await self.send_json({
                "status": "fail",
                "message": "인원이 다 찬 게임방입니다"
            })
            return

        #초대리스트에 아무도 없는 경우
        if len(invited_info) == 0:
            await self.send_json({
                "status": "fail",
                "message": "초대 내역이 없습니다"
            })
            return
        

        flag = False
        idx = -1
        user_idx = -1
        delete_idx = []

        for tmp in invited_info:
            idx += 1
                
            if (tmp["user_id"] == user_id):
                user_idx = idx
                flag = True
                break
           
    
                
        #만료된 초대 리스트 삭제
        for idx in delete_idx:
            parsed_value["invited_info"].pop(user_idx)

        #invited_info 안에 user_id가 없는 경우
        if (flag == False):
            #user_id가 없는 경우
            if (user_idx == -1):
                await self.send_json({
                    'status': 'fail',
                    'message': '초대 대상이 아닙니다'
                })
                return 
        
        parsed_value["registered_user"].append({
            "user_id": user_id,
            "channel_id": self.channel_name
        })

        updated_value = json.dumps(parsed_value)

        if self.lock.acquire_lock():
            try:
                cache.set("tournament_" + str(tournament_id), updated_value)
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
            'status': "success"
        })


    #normal 모드 빠른시작
    async def join_normal(self, text_data_json):
        game_mode = text_data_json["game_mode"]
        user_id = text_data_json["user_id"]
        current_time = text_data_json["current_time"]

        if (Members.objects.filter(id = user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 user id 입니다"
            })
            return

        keys = None
        if self.lock.acquire_lock():
            try:
                keys = cache.keys('normal_*')
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
            game = Game.objects.get(id = int(game_id))

            if (game.game_option.lower() != game_mode.lower()):
                continue
            
            #invite_info에 값이 있는지 확인
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

            #만일 초대리스트에 값이 없다면 게임에 등록
            if len(new_invited_info) == 0:
                new_parsed_value['registered_user'].append({
                    "user_id": user_id,
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

                Participant.objects.create(user_id = Members.objects.get(id = user_id), game_id = game, score = 0)
                break

        
        #만일 flag == true면은 이미 있는 게임에 있는 사람 모두에게 게임 시작 알림
        if (flag == True):
            result_value = None;
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

                user = Members.objects.get(id = id)

                data = {
                    "user_id": id,
                    "nickname": user.nickname,
                    "image_url": user.image_url
                }
                user_info_data.append(data)



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
            new_game = Game.objects.create(game_option=game_mode, game_mode='NORMAL')
            new_game_value = {
                "registered_user": [{
                    "user_id" : user_id,
                    "channel_id": self.channel_name
                }],
                "invited_info": []
            }



            if self.lock.acquire_lock():
                try:
                    cache.set('normal_' + str(new_game.id),  json.dumps(new_game_value))
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
            
            Participant.objects.create(user_id = Members.objects.get(id = user_id), game_id = new_game, score = 0)



    #normal 모드에서 초대를 한 경우
    async def invite_normal(self, text_data_json):
        game_mode = text_data_json["game_mode"]
        user_id = text_data_json["user_id"]
        invite_user_id = text_data_json["invite_user_id"]
        invite_time = text_data_json["invite_time"]

        if (Members.objects.filter(id = user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 user id 입니다"
            })
            return
        
        if (Members.objects.filter(id = invite_user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 invite user id 입니다"
            })
            return

        game = Game.objects.create(game_option=game_mode, game_mode='NORMAL')

        value = {
            "registered_user": [{
                "user_id" : user_id,
                "channel_id": self.channel_name
            }],
            "invited_info": [{
                "user_id": invite_user_id,
                "invited_time": invite_time
            }]
        }


        if self.lock.acquire_lock():
            try:
                cache.set('normal_' + str(game.id),  json.dumps(value))
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
        
        Participant.objects.create(user_id = Members.objects.get(id = user_id), game_id = game, score = 0)

        await self.send_json({
                'status': 'game create success',
                'game_id': game.id
            })



    #normal 모드에서 초대를 받은 경우
    async def join_invite_normal(self, text_data_json):
        game_id = text_data_json["game_id"]
        accept_time = text_data_json["accept_time"]
        user_id = text_data_json["user_id"]

        if (Members.objects.filter(id = user_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 user id 입니다"
            })
            return
        
        if (Game.objects.filter(id = game_id).exists() == False):
            await self.send_json({
                "status": "fail",
                "message": "잘못된 game id 입니다"
            })

        value = None
        if self.lock.acquire_lock():
            try:
                value = cache.get('normal_' + str(game_id))
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
                'status': 'fail',
                'message': '잘못된 game_id 입니다'
            })
            return
    

        parsed_value = json.loads(value)
        invited_info = parsed_value["invited_info"]

        #초대리스트에 아무도 없는 경우
        if len(invited_info) == 0:
            await self.send_json({
                'status': 'fail',
                'message': '초대 내역이 없습니다'
            })
            return
            
        #초대리스트에 등록된 유저가 아닌 경우
        if (invited_info[0]["user_id"] != user_id):
            await self.send_json({
                'status': 'fail',
                'message': '초대 대상이 아닙니다'
            })
            return
        

        #invited_info안의 유저 정보 제거 후, 게임 대기 큐에 등록
        parsed_value["invited_info"].pop(0)
        parsed_value['registered_user'].append({
            "user_id": user_id,
            "channel_id": self.channel_name
        }) 

        updated_value = json.dumps(parsed_value)
        
    
        if self.lock.acquire_lock():
            try:
                cache.set('normal_' + str(game_id), updated_value)
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


        Participant.objects.create(user_id = Members.objects.get(id = user_id), game_id = Game.objects.get(id = game_id), score = 0)

        #게임 시작할 것이라는 response를 모두에게 전달
        new_value = None
        if self.lock.acquire_lock():
            try:
                new_value = cache.get('normal_' + str(game_id))
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
            
        
        #TODO: group 활용하기
        self.game_group_id = "normal_" + str(game_id)

        await self.channel_layer.group_add(
            self.game_group_id, self.channel_name
        )

        # cache.delete('normal_' + str(game_id))

        player_info = []

        for user_info in registered_users:
            id = user_info["user_id"]

            user = Members.objects.get(id = id)

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
    


    async def broadcast_game_start(self, event):
        game_id = event["game_id"]
        player_info = event["player_info"]

        await self.send_json({
            "status": "game_start_soon",
            "game_id": game_id,
            "player_info": player_info
        })

