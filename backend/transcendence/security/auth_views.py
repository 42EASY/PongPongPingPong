from django.shortcuts import render
from rest_framework.views import APIView
from django.conf import settings
from django.http import JsonResponse
from members.models import Members
from security.views import login_required
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from django.utils import timezone
import requests
import random
import string

def new_random_nickname(length=15):
		characters = string.ascii_letters + string.digits
		# 랜덤 문자열 생성
		random_string = ''.join(random.choice(characters) for _ in range(length))
		return random_string

class LoginView(APIView):
	def post(self, request):
		code = request.data.get('code')

		if not code:
			return JsonResponse({
				'code': 400,
				'message': 'Bad request'
			}, status=400)

		token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
			'grant_type': 'authorization_code',
			'client_id': settings.SOCIAL_AUTH_42_KEY,
			'client_secret': settings.SOCIAL_AUTH_42_SECRET,
			'code': code,
			'redirect_uri': settings.LOGIN_CALLBACK_URI,
		})

		ft_access_token = token_response.json().get('access_token')
		if not ft_access_token:
			return JsonResponse({
				'code': 400,
				'message': 'Bad request'
			}, status=400)

		user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
		'Authorization': f'Bearer {ft_access_token}'
		})

		user_info = user_info_response.json()
		new_nickname = new_random_nickname()

		user_data = {
			'nickname': new_nickname,
			'email': user_info.get('email'),
			'is_2fa': False,
			'image_url': settings.DEFAULT_IMAGE_URL,
			'created_at': timezone.now(),
			'modified_at': timezone.now(),
			'deleted_at': None,
		}

		member, created = Members.objects.get_or_create(email=user_data['email'], defaults=user_data)

		refresh = RefreshToken.for_user(member)

		refresh_token = str(refresh)
		access_token = str(refresh.access_token)

		refresh_token_lifetime = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())

		cache.set(f"refresh_token:{member.id}", refresh_token, timeout=refresh_token_lifetime)

		res = JsonResponse({
			'code': 201 if created else 200,
			'message': 'created' if created else 'ok',
			'result': {
				'refresh_token': str(refresh),
				'access_token': access_token,
				'user_id': member.id,
				'email': member.email,
				'is_2fa': member.is_2fa,
				'nickname': member.nickname,
				'image_url': member.image_url,
			}
		})

		#TODO: 개발 환경 설정 변경
		res.set_cookie('refresh_token', refresh_token, httponly=True, samesite='Strict', secure=False, max_age=refresh_token_lifetime) #secure 옵션 -> 개발환경에서는 False

		return res

class LogoutView(APIView):
	@login_required
	def post(self, request):
		id = request.user.id
		try:
			member = Members.objects.get(id=id)

			cache.delete(f"refresh_token:{id}")
			res = JsonResponse({
				'code':200,
				'message':'ok',
				'result':{}
			}, status=200)

			res.delete_cookie('refresh_token', path='/')

			return res
		except Members.DoesNotExist:
			return JsonResponse({
				'code': 404,
				'message': 'Not Found'
			}, status=404)
		except Exception as e:
			return JsonResponse({
				'code': 400,
				'message':'Bad Request'
			}, status=400)
