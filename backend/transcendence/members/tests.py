from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from members.models import Members
from social.models import Friend, Block
from games.models import Participant, Game
from tournaments.models import Tournament, TournamentGame 
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import urlencode
from datetime import datetime
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from django.core.files.storage import default_storage
from urllib.parse import urlparse
import json

# Create your tests here.
class MemberViewPatchTestCase(APITestCase):
	def setUp(self):
		# 가짜 토큰 생성
		self.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False)
		refresh = RefreshToken.for_user(self.fake_user)
		fake_token = str(refresh.access_token)

		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)
	
	def tearDown(self):
		if hasattr(self, 'fake_user'):
			self.fake_user.refresh_from_db()
		if self.fake_user.image_url:
			parsed_url = urlparse(self.fake_user.image_url)
			file_path = parsed_url.path.replace(settings.MEDIA_URL, '', 1)
			if default_storage.exists(file_path):
				default_storage.delete(file_path)

	def test_update_image_only(self):
		url = reverse('members:patch')

		# 테스트용 이미지 파일 생성
		test_image = SimpleUploadedFile("testimage.jpg", b"dummy image data", content_type="image/jpeg")
				
		# PATCH 요청 시뮬레이션
		response = self.client.patch(url, {'image': test_image}, format='multipart')
		
		# 응답 검증
		self.assertEqual(response.status_code, 200)
		self.assertIn('image_url', response.json()['result'])
		self.assertEqual(response.json()['result']['nickname'], 'loginUser')
		self.assertEqual(response.json()['result']['is_2fa'], False)

	def test_update_data_nickname_only(self):
		url = reverse('members:patch')

		# JSON 데이터 업데이트
		test_data = test_data = json.dumps({'nickname': 'new_nickname'})
				
		# PATCH 요청 시뮬레이션
		response = self.client.patch(url, {'data':test_data}, format='multipart')

		# 응답 검증
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['result']['nickname'], 'new_nickname')
		self.assertEqual(response.json()['result']['is_2fa'], False)

	def test_update_data_2fa_only(self):
		url = reverse('members:patch')

		# JSON 데이터 업데이트
		test_data = test_data = json.dumps({'is_2fa': True})

		# PATCH 요청 시뮬레이션
		response = self.client.patch(url, {'data':test_data}, format='multipart')

		# 응답 검증
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['result']['nickname'], 'loginUser')
		self.assertEqual(response.json()['result']['is_2fa'], True)

	def test_update_image_and_data(self):
		url = reverse('members:patch')

		# 테스트용 이미지 파일 및 JSON 데이터 생성
		test_image = SimpleUploadedFile("testimage.jpg", b"dummy image data", content_type="image/jpeg")
		test_data = json.dumps({'nickname': 'another_nickname', 'is_2fa': False})
				
		# PATCH 요청 시뮬레이션
		response = self.client.patch(url, {'image': test_image, 'data': test_data}, format='multipart')

		# 응답 검증
		self.assertEqual(response.status_code, 200)
		self.assertIn('image_url', response.json()['result'])
		self.assertEqual(response.json()['result']['nickname'], 'another_nickname')
		self.assertEqual(response.json()['result']['is_2fa'], False)

class MemberViewGetTestCase(APITestCase):
	def setUp(self):
		# 가짜 토큰 생성
		self.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False)
		refresh = RefreshToken.for_user(self.fake_user)
		fake_token = str(refresh.access_token)

		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)
		
	@classmethod
	def setUpTestData(cls):
		cls.member = Members.objects.create(nickname='testuser', email='testuser@email.com', is_2fa=False)

		game1 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')
		game2 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')
		game3 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

		Participant.objects.create(user_id=cls.member, game_id=game1, score=10, result='WIN')
		Participant.objects.create(user_id=cls.member, game_id=game2, score=0, result='LOSE')
		Participant.objects.create(user_id=cls.member, game_id=game3, score=10, result='WIN')
	
	
	def test_get_member_success(self):
		# 존재하는 멤버에 대한 요청 테스트
		url = reverse('members:get', kwargs={'user_id': self.member.id})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)
		self.assertEqual(response.json()['result']['win_count'], 2)
		self.assertEqual(response.json()['result']['relation'], "NONE")

	def test_get_member_success_friend(self):
		Friend.objects.create(user=self.fake_user, target=self.member)

		# 친구 관계인 유저에 대한 테스트
		url = reverse('members:get', kwargs={'user_id': self.member.id})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)
		self.assertEqual(response.json()['result']['relation'], "FRIEND")

	def test_get_member_success_block(self):
		Block.objects.create(user=self.fake_user, target=self.member)

		# 친구 관계인 유저에 대한 테스트
		url = reverse('members:get', kwargs={'user_id': self.member.id})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)
		self.assertEqual(response.json()['result']['relation'], "BLOCK")

	def test_get_member_fail(self):
		Block.objects.create(user=self.fake_user, target=self.member)

		# 친구 관계인 유저에 대한 테스트
		url = reverse('members:get', kwargs={'user_id': 99999})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
		self.assertEqual(response.json()['code'], 404)

class MemberSearchViewTestCase(APITestCase):
	def setUp(self):
		# 가짜 토큰 생성
		self.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False)
		refresh = RefreshToken.for_user(self.fake_user)
		fake_token = str(refresh.access_token)

		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)

	@classmethod
	def setUpTestData(cls):
		for i in range(5):
			dummy_nickname = 'dummy' + str(i)
			dummy_email = 'dummy' + str(i) + '@test.com'
			Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url')

	#유저목록 목록 반환 테스트(keyword x)
	def test_get_member_list_no_keyword(self):
		query_params = {
		   'keyword': '',
		   'page': 1,
		   'size': 5,
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 200)
		self.assertEquals(response.status_code, 200)
		self.assertEquals(response.json()['result']['total_page'], 2)



	#유저 목록 반환 테스트(keyword o)
	def test_get_member_list_keyword(self):
		query_params = {
		   'keyword': 'dummy',
		   'page': 1,
		   'size': 10
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 200)
		self.assertEquals(response.status_code, 200)
		self.assertEquals(response.json()['result']['total_page'], 1)
		self.assertEquals(len(response.json()['result']['data']), 5)
		

	#유저 목록 반환 실패(유효하지 않는 size - 음수일 때)
	def test_get_member_list_invalid_size(self):
		query_params = {
		   'keyword': '',
		   'page': 1,
		   'size': -1,
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 400)
		self.assertEquals(response.status_code, 400)

	#유저 목록 반환 실패(유효하지 않는 size - 0일때)
	def test_get_member_list_invalid_size_zero(self):
		query_params = {
		   'keyword': '',
		   'page': 1,
		   'size': 0,
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 400)
		self.assertEquals(response.status_code, 400)


	#유저 목록 반환 성공(size가 빈칸일 때)
	def test_get_member_list_invalid_size_null(self):
		for i in range(5):
			dummy_nickname = 'aa' + str(i)
			dummy_email = 'aa' + str(i) + '@test.com'
			Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url')

		query_params = {
		   'keyword': 'aa',
		   'page': 1,
		   'size': ''
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 200)
		self.assertEquals(response.status_code, 200)
	

	#유저 목록 반환 실패(유효하지 않는 페이지 - 음수일 때)
	def test_get_member_list_invalid_page_negative(self):
		query_params = {
		   'keyword': '',
		   'page': -1,
		   'size': 10
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 400)
		self.assertEquals(response.status_code, 400)


	#유저 목록 반환 실패(유효하지 않는 페이지 - 0일때)
	def test_get_member_list_invalid_page_zero(self):  
		query_params = {
		   'keyword': '',
		   'page': 0,
		   'size': 10
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 400)
		self.assertEquals(response.status_code, 400)


	#유저 목록 반환 실패(유효하지 않는 페이지 - 빈칸일 때)
	def test_get_member_list_invalid_page_blank(self):
		query_params = {
		   'keyword': '',
		   'page': '',
		   'size': 10,
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 400)
		self.assertEquals(response.status_code, 400)

	
	#유저 목록 반환 실패(유효하지 않는 페이지 - 존재하는 페이지보다 큰 수 일때)
	def test_get_member_list_invalid_page_big(self):
		query_params = {
		   'keyword': '',
		   'page': 10000,
		   'size': 10
		}

		query_string = urlencode(query_params)
	
		url = reverse('members:search') + '?' + query_string
		response = self.client.get(url)

		self.assertEquals(response.json()['code'], 400)
		self.assertEquals(response.status_code, 400)


class MemberGameViewTestCase(APITestCase):
	def setUp(self):
		# 가짜 토큰 생성
		self.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False)
		refresh = RefreshToken.for_user(self.fake_user)
		fake_token = str(refresh.access_token)

		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)
		
	@classmethod
	def setUpTestData(cls):
		cls.member = Members.objects.create(nickname='testuser', email='testuser@email.com', is_2fa=False)
		cls.member2 = Members.objects.create(nickname='test2user', email='test2user@email.com', is_2fa=False)
		cls.member3 = Members.objects.create(nickname='test3user', email='test3user@email.com', is_2fa=False)

		start_time = timezone.make_aware(datetime(2024, 1, 22, 16, 23, 11))
		end_time = timezone.make_aware(datetime(2024, 1, 22, 17, 55, 12))
		game1 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL', start_time = start_time, end_time = end_time)
		game2 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL', start_time = start_time, end_time = end_time)
		game3 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL', start_time = start_time, end_time = end_time)

		Participant.objects.create(user_id=cls.member, game_id=game1, score=10, result='WIN')
		Participant.objects.create(user_id=cls.member2, game_id=game1, score=5, result='LOSE')

		Participant.objects.create(user_id=cls.member, game_id=game2, score=0, result='LOSE')
		Participant.objects.create(user_id=cls.member2, game_id=game2, score=10, result='WIN')

		Participant.objects.create(user_id=cls.member, game_id=game3, score=10, result='WIN')
		Participant.objects.create(user_id=cls.member3, game_id=game3, score=0, result='LOSE')

		#토너먼트 테스트 데이터
		cls.member4 = Members.objects.create(nickname='test4uer', email='test4user@email.com', is_2fa=False)
		tournamentgame1 = Game.objects.create(game_mode=Game.GameMode.TOURNAMENT, start_time=start_time, end_time=end_time)
		tournamentgame2 = Game.objects.create(game_mode=Game.GameMode.TOURNAMENT, start_time=start_time, end_time=end_time)
		tournamentgame3 = Game.objects.create(game_mode=Game.GameMode.TOURNAMENT, start_time=start_time, end_time=end_time)

		Participant.objects.create(user_id=cls.member, game_id=tournamentgame1, score=10, result=Participant.Result.WIN)
		Participant.objects.create(user_id=cls.member2, game_id=tournamentgame1, score=3, result=Participant.Result.LOSE)

		Participant.objects.create(user_id=cls.member3, game_id=tournamentgame2, score=6, result=Participant.Result.LOSE)
		Participant.objects.create(user_id=cls.member4, game_id=tournamentgame2, score=10, result=Participant.Result.WIN)

		Participant.objects.create(user_id=cls.member, game_id=tournamentgame3, score=10, result=Participant.Result.WIN)
		Participant.objects.create(user_id=cls.member4, game_id=tournamentgame3, score=7, result=Participant.Result.LOSE)

		tournament = Tournament.objects.create()

		TournamentGame.objects.create(game_id=tournamentgame1, tournament_id=tournament, round=TournamentGame.Round.SEMI_FINAL)
		TournamentGame.objects.create(game_id=tournamentgame2, tournament_id=tournament, round=TournamentGame.Round.SEMI_FINAL)
		TournamentGame.objects.create(game_id=tournamentgame3, tournament_id=tournament, round=TournamentGame.Round.FINAL)
		


	#normal 모드일때의 전적 검색 반환 성공 테스트
	def test_get_normal_records_success(self):
		query_params = {
			'mode': 'NORMAL',
			'page': 1,
			'size': 10
		}

		query_string = urlencode(query_params)

		url = reverse('members:member-game', kwargs={'user_id': self.member.id}) + '?' + query_string
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)

		self.assertEqual(response.json()['result']['data'][0]['player_one']['nickname'], 'testuser')
		self.assertEqual(response.json()['result']['data'][0]['player_two']['nickname'], 'test2user')
		self.assertEqual(response.json()['result']['data'][0]['player_two']['score'], 5)
		
		self.assertEqual(response.json()['result']['data'][1]['player_one']['nickname'], 'testuser')
		self.assertEqual(response.json()['result']['data'][1]['player_two']['nickname'], 'test2user')
		self.assertEqual(response.json()['result']['data'][1]['player_two']['score'], 10)

		self.assertEqual(response.json()['result']['data'][2]['player_one']['nickname'], 'testuser')
		self.assertEqual(response.json()['result']['data'][2]['player_two']['nickname'], 'test3user')
		self.assertEqual(response.json()['result']['data'][2]['player_two']['score'], 0)


	#normal 모드일때의 전적 검색 반환 성공 테스트(전적이 없을때)
	def test_get_normal_records_success_no_records(self):
		tmp = Members.objects.create(nickname='tmp', email='tmp@email.com', is_2fa=False)

		query_params = {
			'mode': 'NORMAL',
			'page': 1,
			'size': 10
		}

		query_string = urlencode(query_params)

		url = reverse('members:member-game', kwargs={'user_id': tmp.id}) + '?' + query_string
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)



	#normal 모드일때의 전적 검색 반환 실패 테스트(존재하지 않는 유저)
	def test_get_normal_records_not_exist_user(self):
		query_params = {
			'mode': 'NORMAL',
			'page': 1,
			'size': 10
		}

		query_string = urlencode(query_params)

		url = reverse('members:member-game', kwargs={'user_id': 11111111}) + '?' + query_string
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
		self.assertEqual(response.json()['code'], 404)



	#tournament 모드일때의 전적 검색 반환 성공 테스트
	def test_get_tournament_records_success(self):
		query_params = {
			'mode': Game.GameMode.TOURNAMENT,
			'page': 1,
			'size': 10
		}

		query_string = urlencode(query_params)

		url = reverse('members:member-game', kwargs={'user_id': self.member.id}) + '?' + query_string
		response = self.client.get(url)

		print(response.json()['message'])
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)



	#tournament 모드일때의 전적 검색 반환 성공 테스트(전적이 없을때)
	def test_get_tournament_records_success_no_records(self):
		tmp = Members.objects.create(nickname='tmp', email='tmp@email.com', is_2fa=False)

		query_params = {
			'mode': Game.GameMode.TOURNAMENT,
			'page': 1,
			'size': 10
		}

		query_string = urlencode(query_params)

		url = reverse('members:member-game', kwargs={'user_id': tmp.id}) + '?' + query_string
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)
