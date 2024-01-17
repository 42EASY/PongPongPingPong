from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from members.models import Members
from myjwt.views import login_required
from rest_framework_simplejwt.tokens import RefreshToken
import datetime
import environ
import os
import requests

# Create your views here.
class LoginView(APIView):
	def post(self, request):
		# access_token이 없는 경우.. 

		code = request.data.get('code')
		# 테스트를 위해 직접 code를 파싱함. 논의한 방식대로면 프론트에서 Post로 Body를 받아 처리해야할듯.
		# code = request.GET.get('code')
		if not code:
			return JsonResponse({
				'code': 400,
				'message': 'Bad request'
			}, status=400)
		
		token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
			'grant_type': 'authorization_code',
			'client_id': os.environ.get('SOCIAL_AUTH_42_KEY'),
			'client_secret': os.environ.get('SOCIAL_AUTH_42_SECRET'),
			'code': code,
			'redirect_uri': os.environ.get('LOGIN_CALLBACK_URI'),
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

		user_data = {
			'nickname': user_info.get('login'),
			'email': user_info.get('email'),
			'is_2fa': False,
			'image_url': user_info.get('image_url'),
			'refresh_token': None,
			'created_at': datetime.datetime.now(),
			'modified_at': datetime.datetime.now(),
			'deleted_at': None,
		}

		member, created = Members.objects.get_or_create(email=user_data['email'], defaults=user_data)

		refresh = RefreshToken.for_user(member)
		member.refresh_token = str(refresh)
		member.save()

		access_token = str(refresh.access_token)
		
		if created:
			return JsonResponse({
				'code':201,
				'message':'created',
				'result': {
					'refresh_token': str(refresh),
					'access_token': access_token,
					'user_id': member.id,
					'email':member.email,
					'is_2fa':member.is_2fa,
				}
			}, status=201)
		else:
			return JsonResponse({
				'code':200,
				'message':'ok',
				'result': {
					'refresh_token': str(refresh),
					'access_token': access_token,
					'user_id': member.id,
					'is_2fa':member.is_2fa,
				}
			}, status=200)

			
class LogoutView(APIView):
	@login_required
	def post(self, request):
		id = request.user.id
		try:
			member = Members.objects.get(id=id)

			member.refresh_token = None
			member.save()

			return JsonResponse({
				'code':200,
				'message':'ok',
				'result':{}
			}, status=200)
		except Exception as e:
			# exception이 생길만한 상황들 고려
			return JsonResponse({
				'code': 404,
				'message':'Not Found'
			}, status=404)
