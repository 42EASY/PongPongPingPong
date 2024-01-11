from django.urls import path
from swagger.views import TestView

urlpatterns = [
	path('v1/test/', TestView.as_view(), name='test'),
]
