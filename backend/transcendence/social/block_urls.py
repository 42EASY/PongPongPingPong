from django.urls import path
from social.block_views import BlockView

app_name = 'block'

urlpatterns = [
    path('/<int:user_id>', BlockView.as_view(), name = 'post'),
    path('/<int:user_id>', BlockView.as_view(), name = 'delete'),
    path('', BlockView.as_view(), name = 'get')
]
