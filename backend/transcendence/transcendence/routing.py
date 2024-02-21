from django.urls import re_path
from games.game_consumer import GameConsumer
from games.game_queue_consumer import GameQueueConsumer 
from games.game_room_consumer import GameRoomConsumer
from chat import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<game_id>\w+)/$', GameConsumer.as_asgi()),
    re_path(r'ws/join_queue/$', GameQueueConsumer.as_asgi()),
    re_path(r'ws/join/$', consumers.BaseConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<target_user_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/join_room/(?P<room_id>)\w+)/$', GameRoomConsumer.as_asgi()),
]
