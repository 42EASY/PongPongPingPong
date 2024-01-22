from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from members.models import Members
from security.views import login_required
from social.models import Block, Friend, Relation
from games.models import Participant
from django.db.models import Count, Q

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
