from django.shortcuts import render
from rest_framework.views import APIView
from django.http import JsonResponse
from members.models import Members
from security.views import login_required
from social.models import Block, Friend, Relation
from games.models import Game, Participant
from django.db.models import Count, Q
from django.core.paginator import Paginator
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist

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


class MemberGameView(APIView):
	@login_required
	def get(self, request, user_id):
		mode = request.GET.get('mode', None)
		page = request.GET.get('page', None)
		size = request.GET.get('size', None)

		try:
			user = Members.objects.get(id = user_id)
			loginUser = request.user
			
		except:
			return JsonResponse({
            	'code': 404,
            	'message': 'Not Found'
            }, status = 404)

		if (page == None or page == ''):
			return JsonResponse({
				'code': 400,
				'message':'Page Error'
			}, status = 400)

		#만일 size값이 없으면 size는 10으로 지정
		if (size == None or size == ''):
			size = 10
    		
		data = []
       
		if (mode == Game.GameMode.NORMAL):

			try:
				game_list = Participant.objects.filter(user_id = user_id).order_by('user_id')

			except:
				return JsonResponse({
			    	'code': 400,
					'message':'Model Error'
				}, status = 400)


			try:
				paginator = Paginator(game_list, size)
				total_page = paginator.num_pages
				
			except:
				return JsonResponse({
			    	'code': 400,
					'message':'Paginator Error'
				}, status = 400)
        

			#total page의 범위를 벗어난 page를 가지고자 한 경우
			if (int(total_page) < int(page)) or (int(page) <= 0):
				return JsonResponse({
			    'code': 400,
				'message':'Page Index Error'
			}, status = 400)
        

			try:
				page_obj = paginator.get_page(page)
        
			except:
				return JsonResponse({
                	'code': 400,
                	'message': 'Get Page Error'
            	}, status = 400)

			try: 
				for participant in page_obj:
					game = participant.game_id
	
					participants_in_game = Participant.objects.filter(game_id = game.game_id) 
					user_ids_in_game = participants_in_game.values_list('user_id', flat = True)
				
					opponent_player = Members.objects.exclude(id=user_id).get(id__in=user_ids_in_game)

					participant_opponent_player = Participant.objects.get(game_id = game, user_id = opponent_player)
					
					total_duration = game.end_time - game.start_time
					total_minutes, total_seconds = divmod(total_duration.total_seconds(), 60)
					game_time = "{:02d}-{:02d}".format(int(total_minutes), int(total_seconds))
					
					player1 = {
						'user_id': user_id,
						'image_url': user.image_url,
						'nickname': user.nickname,
						'score': participant.score,
						'result': participant.result 
					}

					player2 = {
						'user_id': opponent_player.id,
						'image_url': opponent_player.image_url,
						'nickname': opponent_player.nickname,
						'score': participant_opponent_player.score,
						'result': participant_opponent_player.result 
					}

					game_data = {
						'option': game.game_option,
						'game_date': game.start_time.strftime("%Y-%m-%d"),
						'playtime': game_time,
						'player_one': player1,
						'player_two': player2
					}
					data.append(game_data)
				
			except:
				return JsonResponse({
                	'code': 400,
                	'message': 'Get Data Error'
            	}, status = 400)


		elif (mode == Game.GameMode.TOURNAMENT):
			#TODO: 구현
			print('hi')

		else:
			return JsonResponse({
				'code': 400,
				'message':'Mode Error'
			}, status = 400)

		result = {
			'data': data,
			'total_page': total_page
		}

		return JsonResponse({
            'code': 200,
            'message': 'ok',
            'result' : result
        }, status = 200)
