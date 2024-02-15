from django.urls import re_path, path
from games.consumers import GameConsumer
from chat import consumers

websocket_urlpatterns = [
    #path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()),
    path(r'ws/game/<int:room_id>', GameConsumer.as_asgi()),
    re_path(r'ws/join/$', consumers.BaseConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<target_user_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]
