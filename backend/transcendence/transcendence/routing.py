from django.urls import re_path, path
from games.consumers import GameConsumer
from games.game_queue_consumer import GameQueueConsumer 
from chat import consumers

websocket_urlpatterns = [
    path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()), #TODO: 테스트용이므로 지울 예정
    re_path(r'ws/join_queue', GameQueueConsumer.as_asgi()),
    re_path(r'ws/join/$', consumers.BaseConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<target_user_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]
