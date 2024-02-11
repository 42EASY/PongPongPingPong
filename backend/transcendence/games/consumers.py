import json
# from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncJsonWebsocketConsumer

#TODO: 연결되는 것 확인하기 위해 임시로 코드 작성
class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print('hi')
        self.game_id = 10
        self.channel_name = 'hi'
        self.game_group_id = f"game_{self.game_id}"

        # Join group
        await self.channel_layer.group_add(
            self.game_group_id, self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.game_group_id, self.channel_name
        )

    #connect 이후 receive 및 send 할 내용 정의
    async def receive(self, text_data):
        
        print('receive')

        await self.send_json({
                'type': 'game_message',
                'message': 'hello'
            }    
        )

    # Method to receive message from group
    async def game_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
