from django.urls import re_path, path
from games.consumers import GameConsumer
from games.game_queue_consumer import GameQueueConsumer 

websocket_urlpatterns = [
    path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()),
    path(r'ws/join_queue', GameQueueConsumer.as_asgi()),
]
