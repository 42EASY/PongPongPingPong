from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from members.models import Members
from security.views import login_required
from .modelSerializer import MemberSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from social.models import Block, Friend, Relation
from games.models import Participant
from django.db.models import Count, Q
from django.core.files.storage import default_storage
from urllib.parse import urlparse
from django.conf import settings
import os
import json

# Create your views here.
class MemberView(APIView):
	@login_required
	def get(self, request, user_id):
		try:
			user = Members.objects.get(id=user_id)
			loginUser = request.user
			isFriend = Friend.objects.filter(user=loginUser, target=user).exists()
			isBlocked = Block.objects.filter(user=loginUser, target=user).exists()

			relation = Relation.NONE._name_
			if isBlocked:
				relation = Relation.BLOCK._name_
			elif isFriend:
				relation = Relation.FRIEND._name_

			game_stats = Participant.objects.filter(user_id=user.id).aggregate(
				total_games=Count('id'),  # 'id' 필드를 기준으로 총 게임 수 집계
				win_count=Count('id', filter=Q(result=Participant.Result.WIN)),  # 승리한 게임 수
				lose_count=Count('id', filter=Q(result=Participant.Result.LOSE))  # 패배한 게임 수
			)

			total_games = game_stats['total_games']
			win_count = game_stats['win_count']
			lose_count = game_stats['lose_count']

			return JsonResponse({
				'code': 200,
				'message': 'ok',
				"result" : {
					"user_id" : user.id,
					"image_url" : user.image_url,
					"nickname" : user.nickname,
					"relation" : relation,
					"game_count" : total_games,
					"win_count" : win_count,
					"lose_count" : lose_count
					}
			})

		except Members.DoesNotExist:
			return JsonResponse({
				'code': 404,
				'message':'Not Found'
			}, status=404)
	
	parser_classes = (MultiPartParser, FormParser)

	@login_required
	def patch(self, request):
		try:
			user = request.user
			file = request.FILES.get('image')
			origin_data = request.data.get('data')

			if file:
				if user.image_url:
					parsed_url = urlparse(user.image_url)
					old_file_path = parsed_url.path.replace(settings.MEDIA_URL, '', 1)
					if default_storage.exists(old_file_path):
						default_storage.delete(old_file_path)
					
				file_path = default_storage.save(os.path.join(str(user.id), file.name), file)
				file_url = default_storage.url(file_path)
				user.image_url = file_url
				user.save()

			if origin_data:
				data = json.loads(origin_data)
				serializer = MemberSerializer(user, data=data, partial=True)
			
				if serializer.is_valid():
					serializer.save()

		except:
			return JsonResponse({
				'code':400,
				'message':'Bad Request'
			}, status=400)
		
		# TODO: image_url 반환까진 성공하였으나, 저장된 이미지를 보여주는 방법에 대해 고려
		return JsonResponse({
			'code':200,
			'message':'ok',
			'result': {
				'user_id':user.id,
				'image_url':user.image_url,
				'nickname':user.nickname,
				'is_2fa':user.is_2fa,
			}
		}, status=200)
