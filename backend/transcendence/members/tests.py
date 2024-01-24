from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from members.models import Members
from social.models import Friend, Block
from games.models import Participant, Game
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import urlencode
from datetime import datetime
from django.utils import timezone

# Create your tests here.
class MemberViewTestCase(APITestCase):
	def setUp(self):
		# 가짜 토큰 생성
		self.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False, refresh_token='refresh_token')
		refresh = RefreshToken.for_user(self.fake_user)
		fake_token = str(refresh.access_token)

		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)
		
	@classmethod
	def setUpTestData(cls):
		cls.member = Members.objects.create(nickname='testuser', email='testuser@email.com', is_2fa=False, refresh_token='refresh_token')

		game1 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')
		game2 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')
		game3 = Game.objects.create(game_option='CLASSIC', game_mode='NORMAL')

		Participant.objects.create(user_id=cls.member, game_id=game1, score=10, result='WIN')
		Participant.objects.create(user_id=cls.member, game_id=game2, score=0, result='LOSE')
		Participant.objects.create(user_id=cls.member, game_id=game3, score=10, result='WIN')
	
	
	def test_get_member_success(self):
		# 존재하는 멤버에 대한 요청 테스트
		url = reverse('members:member-profile', kwargs={'user_id': self.member.id})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)
		self.assertEqual(response.json()['result']['win_count'], 2)
		self.assertEqual(response.json()['result']['relation'], "NONE")

	def test_get_member_success_friend(self):
		Friend.objects.create(user=self.fake_user, target=self.member)

		# 친구 관계인 유저에 대한 테스트
		url = reverse('members:member-profile', kwargs={'user_id': self.member.id})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)
		self.assertEqual(response.json()['result']['relation'], "FRIEND")

	def test_get_member_success_block(self):
		Block.objects.create(user=self.fake_user, target=self.member)

		# 친구 관계인 유저에 대한 테스트
		url = reverse('members:member-profile', kwargs={'user_id': self.member.id})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.json()['code'], 200)
		self.assertEqual(response.json()['result']['relation'], "BLOCK")

	def test_get_member_fail(self):
		Block.objects.create(user=self.fake_user, target=self.member)

		# 친구 관계인 유저에 대한 테스트
		url = reverse('members:member-profile', kwargs={'user_id': 99999})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
		self.assertEqual(response.json()['code'], 404)



class MemberGameViewTestCase(APITestCase):
	def setUp(self):
		# 가짜 토큰 생성
		self.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False, refresh_token='refresh_token')
		refresh = RefreshToken.for_user(self.fake_user)
		fake_token = str(refresh.access_token)

		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)
		
	@classmethod
	def setUpTestData(cls):
		cls.member = Members.objects.create(nickname='testuser', email='testuser@email.com', is_2fa=False, refresh_token='refresh_token')
		cls.member2 = Members.objects.create(nickname='test2user', email='test2user@email.com', is_2fa=False, refresh_token='refresh_token2')
		cls.member3 = Members.objects.create(nickname='test3user', email='test3user@email.com', is_2fa=False, refresh_token='refresh_token3')

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
		tmp = Members.objects.create(nickname='tmp', email='tmp@email.com', is_2fa=False, refresh_token='refresh_token_tmp')

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
