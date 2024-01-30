from django.urls import path
from social.friends_views import FriendsView

app_name = 'friends'

urlpatterns = [
    path('/<int:user_id>', FriendsView.as_view(), name = 'post'),
    path('/<int:user_id>', FriendsView.as_view(), name = 'delete'),
    path('', FriendsView.as_view(), name = 'get')
]