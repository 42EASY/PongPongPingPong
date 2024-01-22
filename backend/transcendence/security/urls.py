from django.urls import path
from security.views import JwtView

urlpatterns = [
    path('refresh', JwtView.as_view()),
]
