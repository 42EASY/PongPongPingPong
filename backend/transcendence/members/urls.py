from django.urls import path
from members.views import MemberView, MemberSearchView
from members.views import MemberGameView

urlpatterns = [
    path('/<int:user_id>/records', MemberGameView.as_view(), name='member-game'),
    path('/<int:user_id>', MemberView.as_view(), name='get'),
    path('', MemberView.as_view(), name='patch'),
    path('/search', MemberSearchView.as_view(), name='search') #라우트가 구분이 안되는 문제가 있어 변경
]
