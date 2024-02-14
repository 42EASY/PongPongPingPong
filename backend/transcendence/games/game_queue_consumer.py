import json

from django.core.cache import cache
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncJsonWebsocketConsumer

INVITE_TIME = 60

class GameQueueConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):

        self.game_group_id = "10"
    
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

        if (text_data_json["action"] == "join_invite_normal_queue"):
            await self.join_invite_normal(text_data_json)

    #normal 모드에서 초대를 받은 경우
    async def join_invite_normal(self, text_data_json):
        game_id = text_data_json["game_id"]
        accept_time = text_data_json["accept_time"]
        user_id = text_data_json["user_id"]

        value = cache.get('normal_' + str(game_id))

        #redis에 key 또는 value가 없는 경우
        if (value is None):
            await self.send_json({
                'status': 'fail',
                'message': '잘못된 game_id 입니다'
            })
            return
    
        
        # json_value = value.decode('utf-8')
        # parsed_value = json.loads(json_value)
        parsed_value = json.loads(value)
        invited_info = parsed_value["invited_info"]

        #초대리스트에 아무도 없는 경우
        if len(invited_info) == 0:
            await self.send_json({
                'status': 'fail',
                'message': '초대 내역이 없습니다'
            })
            return
            
        
        flag = False
        idx = -1
            
        for tmp in invited_info:
            idx += 1
                
            if (tmp["user_id"] == user_id):
                accept_time_datetime = datetime.fromisoformat(accept_time)
                invited_time_datetime = datetime.fromisoformat(tmp["invited_time"])
                    
                time_difference = accept_time_datetime - invited_time_datetime

                #초대 받은 시간이 유효한 경우
                if time_difference <= timedelta(seconds=INVITE_TIME):
                    flag = True
                    break
                
        #invited_info 안에 user_id가 없거나, 유효한 초대 시간이 아닌 경우
        if (flag == False):
            #유효한 초대 시간이 아닌경우
            if (invited_info[idx]["user_id"] == user_id):
                await self.send_json({
                    'status': 'fail', 
                    'message': '초대 가능 시간이 초과되었습니다'
                })
                    
                #초대리스트에서 삭제
                parsed_value["invited_info"].pop(idx)
                updated_value = json.dumps(parsed_value)
                cache.set('normal_' + str(game_id), updated_value)
                
            else: 
                await self.send_json({
                    'status': 'fail',
                    'message': '초대 대상이 아닙니다'
                })

            return 
                    
        #invited_info안의 유저 정보 제거 후, 게임 대기 큐에 등록
        parsed_value["invited_info"].pop(idx)
        parsed_value['registered_user'].append({
            "user_id": user_id,
            "channel_id": self.channel_name
        }) 

        updated_value = json.dumps(parsed_value)
        cache.set('normal_' + str(game_id), updated_value)

        #게임 시작할 것이라는 response를 모두에게 전달
        new_value = cache.get('normal_' + str(game_id))
        json_new_value = new_value.encode('utf-8')
        parsed_new_value = json.loads(json_new_value)

        registered_users = parsed_new_value["registered_user"]
            
        self.game_group_id = "normal_" + str(game_id)

        await self.channel_layer.group_add(
            self.game_group_id, self.channel_name
        )

        for user_info in registered_users:
                         
            await self.channel_layer.send(
                user_info["channel_id"],
                {
                    'type': 'broadcast_game_start',
                    'game_id': game_id
                })
    
    async def broadcast_game_start(self, game_id):
        await self.send_json({
            "status": "game_start_soon",
            "game_id": game_id
        })

