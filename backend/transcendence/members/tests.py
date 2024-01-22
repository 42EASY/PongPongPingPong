from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from members.models import Members
from social.models import Friend, Block
from games.models import Participant, Game
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

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
