from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from members.models import Members
from social.models import Friend, Block
from games.models import Participant, Game
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from django.core.files.storage import default_storage
from urllib.parse import urlparse
import json

# Create your tests here.
class MemberViewPatchTestCase(APITestCase):
	def setUp(self):
		# 가짜 토큰 생성
		self.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False, refresh_token='refresh_token')
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
