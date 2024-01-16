from django.urls import path
from myjwt.views import MyJwtView

urlpatterns = [
    path('refresh', MyJwtView.as_view()),
]
