from django.urls import re_path
from games.game_consumer import GameConsumer
from games.game_queue_consumer import GameQueueConsumer 
from games.game_room_consumer import GameRoomConsumer
from chat.consumers import ChatConsumer
from notify.consumer import NotifyConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<game_id>\w+)/$', GameConsumer.as_asgi()),
    re_path(r'ws/join_queue/$', GameQueueConsumer.as_asgi()),
    re_path(r'ws/chat/$', ChatConsumer.as_asgi()),
    re_path(r'ws/join_room/(?P<room_id>\w+)/$', GameRoomConsumer.as_asgi()),
    re_path(r'ws/notify/$', NotifyConsumer.as_asgi()),
]
