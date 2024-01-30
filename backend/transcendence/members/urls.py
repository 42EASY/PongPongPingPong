from django.urls import path
from members.views import MemberView
from members.views import MemberGameView

urlpatterns = [
    path('<int:user_id>/records', MemberGameView.as_view(), name='member-game'),
    path('<int:user_id>', MemberView.as_view(), name='get'),
    path('', MemberView.as_view(), name='patch')
]
