from django.urls import path
from security.two_factor_views import TwoFactorAuthView

urlpatterns = [
    path('', TwoFactorAuthView.as_view()),
]
