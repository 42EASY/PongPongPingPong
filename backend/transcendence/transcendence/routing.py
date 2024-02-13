from django.urls import re_path, path
from games.consumers import GameConsumer
from chat.consumers import ChatConsumer

websocket_urlpatterns = [
    #path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()),
    path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()),
    re_path(r'ws/chat', ChatConsumer.as_asgi()), # 임시 라우트
]
