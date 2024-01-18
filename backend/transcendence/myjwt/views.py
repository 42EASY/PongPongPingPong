from django.http import JsonResponse
from members.models import Members
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from functools import wraps
import jwt
import os
import environ

class MyJwtView(APIView):
	def post(self, request):
		# TODO: 헤더에서 가져오도록 해야함.
		received_refresh_token = request.data.get('refresh_token')

		try:
			token = Members.objects.get(refresh_token=received_refresh_token)
		except Members.DoesNotExist:
			return JsonResponse({
				'code':403,
				'message':'Forbidden'
			}, status=403)

		# 새로운 access_token 생성
		refresh = RefreshToken(token.refresh_token)
		new_access_token = str(refresh.access_token)

		return JsonResponse({
				'code':200,
				'message':'ok',
				'result': {
					'access_token': new_access_token,
				}
			}, status=200)

def login_required(func):
	@wraps(func)
	def wrapper(self, request, *args, **kwargs):
		header = request.META.get('HTTP_AUTHORIZATION', None)
		if not header:
			return JsonResponse(
				{'code':401,
				'message':'Unauthorized'},
				status=401
			)
		
		token = header.split()[1]
		try:
			payload = jwt.decode(token, os.environ.get('JWT_SECRET_KEY'), algorithms=['HS256'])
			user_id = payload.get('user_id')
			user = Members.objects.get(id=user_id)
			request.user = user
		except jwt.ExpiredSignatureError:
			return JsonResponse({
				'code':401,
				'message':'Token expired'
			}, status=401)
		except jwt.DecodeError:
			return JsonResponse({
				'code':401,
				'message':'Invalid token'
			}, status=401)
		except Members.DoesNotExist:
			return JsonResponse({
				'code':404,
				'message':'Not Found',
			})
		
		return func(self, request, *args, **kwargs)

	return wrapper
