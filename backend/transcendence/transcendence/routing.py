from django.urls import re_path, path
from games.consumers import GameConsumer

websocket_urlpatterns = [
    #path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()),
    path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()),
]
