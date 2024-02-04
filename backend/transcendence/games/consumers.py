import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

#TODO: 연결되는 것 확인하기 위해 임시로 코드 작성
class GameConsumer(WebsocketConsumer):
    def connect(self):
        print('hi')
        self.game_id = 10
        self.channel_name = 'hi'
        self.game_group_id = f"game_{self.game_id}"

        # Join group
        async_to_sync(self.channel_layer.group_add)(
            self.game_group_id, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.game_group_id, self.channel_name
        )

    def receive(self, text_data):
        
        print('receive')
        # Echo message back to the group
        async_to_sync(self.channel_layer.group_send)(
            self.game_group_id,
            {
                'type': 'game_message',
                #'message': text_data_json['message']  # Echo back received message
                'message': 'hello'
            }
        )

    # Method to receive message from group
    def game_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))
