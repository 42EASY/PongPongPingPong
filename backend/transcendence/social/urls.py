from django.urls import path
from social.views import BlockView

urlpatterns = [
    path('<int:user_id>', BlockView.as_view()),
]