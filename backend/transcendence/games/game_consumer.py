import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from members.models import Members
from games.models import Game, Participant
from django.core.cache import cache
from urllib.parse import parse_qs
from jwt import decode as jwt_decode, exceptions as jwt_exceptions
from django.conf import settings

class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        path = self.scope['path']
        self.game_id = path.strip('/').split('/')[-1]
        
        token = parse_qs(self.scope["query_string"].decode("utf8")).get("token", [None])[0]

        decoded_data = jwt_decode(token, settings.SIMPLE_JWT['SIGNING_KEY'], algorithms=["HS256"])
        self.user = Members.objects.get(id = decoded_data['user_id'])
        

        #game_id 검증
        try:
            self.game = Game.objects.get(id = self.game_id)
        except:
            await self.send_json({
                "status": "fail",
                "message": "잘못된 game id 입니다"
            })
            return

        #노멀 게임인 경우
        if (self.game.game_mode == Game.GameMode.NORMAL):
            self.game_mode = Game.GameMode.NORMAL
            self.key = 'normal_' + self.game_id
            value = cache.get(self.key)

            parsed_value = json.loads(value)

            registered_user = parsed_value["registered_user"]

            flag = False;
            idx = -1
            for user in registered_user:
                idx += 1
                if (user["user_id"] != self.user.id):
                    try:
                        self.opponent = Members.objects.get(id = user["user_id"])
                    except:
                        await self.send_json({
                            "status": "fail",
                            "message": "상대 플레이어가 존재하지 않습니다"
                        })
                        return
                else:
                    #channel_id 갱신
                    #TODO: channel_id를 redis에 갱신하며 담을지, 테이블에 넣을지 고민
                    parsed_value["registered_user"][idx]["channel_id"] = self.channel_name
                    flag = True
                
                    
            if (flag == False):
                await self.send_json({
                    "status": "fail",
                    "message": "등록되지 않은 유저입니다"
                })
                return
            
            updated_value = json.dumps(parsed_value)
            cache.set(self.key, updated_value)

            
        

            

        #TODO: 토너먼트인 경우
        
        
        #게임 정보를 담을 participant 테이블 생성
        #테이블이 존재하지 않으면 새롭게 생성, 존재하면 변수에 값만 담아둠
        if (Participant.objects.filter(user_id = self.user, game_id = self.game).exists() == False):
            self.user_participant = Participant.objects.create(user_id = self.user, game_id = self.game, score = 0)
        else:
            self.user_participant = Participant.objects.get(user_id = self.user, game_id = self.game)

        if (Participant.objects.filter(user_id = self.opponent, game_id = self.game).exists() == False):
            self.opponent_participant = Participant.objects.create(user_id = self.opponent, game_id = self.game, score = 0)
        else:
            self.opponent_participant = Participant.objects.get(user_id = self.opponent, game_id = self.game)
            
        
        await self.accept()



    async def disconnect(self, close_code):
        #TODO: 게임 중간에 나가면, 나가지 않은 사람이 이긴사람 처리

        print(close_code)

    #connect 이후 receive 및 send 할 내용 정의
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        action = text_data_json["action"]

        if (action == "round_win"):
            await self.round_over()


    
    #한 라운드가 끝난 경우(round_win이라는 action 보낸 사람이 1점을 얻은 경우)
    async def round_over(self):
        self.user_participant.score = self.user_participant.score + 1
        self.user_participant.save()
        #TODO: save 안해도 적용되는지 확인
    
        #TODO: 토너먼트인 경우 구현하기

        #10점인 경우 게임 over 알림
        if (self.user_participant.score == 10):
            
            #normal인 경우
            if (self.game_mode == Game.GameMode.NORMAL):
                
                value = cache.get(self.key)
                parsed_value = json.loads(value)
                registered_user = parsed_value["registered_user"]

                for user in registered_user:
                    await self.channel_layer.send(
                        user["channel_id"],
                        {
                            'type': 'broadcast_game_status',
                            'message': 'normal_game_over',
                            'game_status': [{ "user_id" : self.user.id, "score": self.user_participant.score }, 
                                            { "user_id" : self.opponent.id, "score" : self.opponent_participant.score}]
                        })


                cache.delete(self.key)

        else:
            #normal인 경우
            if (self.game_mode == Game.GameMode.NORMAL):
                
                value = cache.get(self.key)
                parsed_value = json.loads(value)
                registered_user = parsed_value["registered_user"]

                for user in registered_user:
                    await self.channel_layer.send(
                        user["channel_id"],
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