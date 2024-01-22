from django.urls import path
from members.views import MemberView

urlpatterns = [
    path('<int:user_id>', MemberView.as_view(), name='member-profile'),
]
