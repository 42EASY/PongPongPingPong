from django.test import TestCase
from members.models import Members
from social.models import Block
from django.urls import reverse
from urllib.parse import urlencode
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient

client = APIClient()

class BlockViewTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.fake_user = Members.objects.create(nickname='loginUser', email='loginUser@email.com', is_2fa=False)
        refresh = RefreshToken.for_user(cls.fake_user)
        fake_token = str(refresh.access_token)
        
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + fake_token)
        
        cls.target_model = Members.objects.create(nickname = 'target', email = 'target@test.com', is_2fa = False,
                                        image_url = 'test_url')
        
        
        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url')
            Block.objects.create(user = cls.fake_user, target = dummy)


    #loginuser가 target을 친구 차단 성공 테스트
    def test_post_block_success(self):
        target_model = Members.objects.get(nickname = 'target')

        url = reverse('block:post', kwargs = {'user_id' : target_model.id})
        response = client.post(url)

        self.assertEquals(response.json()['code'], 201)
        self.assertEquals(response.status_code, 201)


    #target user가 없는 유저 친구 차단 실패 테스트    
    def test_post_block_no_target_user(self):
        url = reverse('block:post', kwargs = {'user_id' : 100})
        response = client.post(url)

        self.assertEquals(response.json()['code'], 404)
        self.assertEquals(response.status_code, 404)

    #loginuser가 차단한 target을 차단 해제 성공 테스트
    def test_delete_block_success(self):
        target_model = Members.objects.get(nickname = 'target')

        Block.objects.create(user = self.fake_user, target = target_model)

        url = reverse('block:delete', kwargs = {'user_id' : target_model.id})
        response = client.delete(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)


    #loginuser의 차단 목록 반환 테스트(keyword x)
    def test_get_block_list_no_keyword(self):

        query_params = {
           'keyword': '',
           'page': 1,
           'size': 5,
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)




    #loginuser의 차단 목록 반환 테스트(keyword o)
    def test_get_block_list_keyword(self):
        tmp = Members.objects.create(nickname = 'tmp', email = 'tmp@test.com', is_2fa = False, image_url = 'test_url')
        Block.objects.create(user = self.fake_user, target = tmp)

        query_params = {
           'keyword': 't',
           'page': 1,
           'size': 1,
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)
        self.assertEquals(response.json()['result']['total_page'], 1)


    #loginuser의 차단 목록 반환 실패(유효하지 않는 size - 음수일 때)
    def test_get_block_list_invalid_size_negative(self):
        query_params = {
           'keyword': '',
           'page': 1,
           'size': -1
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)


    #loginuser의 차단 목록 반환 실패(유효하지 않는 size - 0일때)
    def test_get_block_list_invalid_size_zero(self):
        query_params = {
           'keyword': '',
           'page': 1,
           'size': 0,
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)

    #loginuser의 차단 목록 반환 성공(size가 큰 수일 때)
    def test_get_block_list_invalid_size_big(self):
        query_params = {
           'keyword': '',
           'page': 1,
           'size': 100000000000000,
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)


    #loginuser의 차단 목록 반환 성공(size가 빈칸일 때)
    def test_get_block_list_invalid_size_null(self):
        for i in range(5):
            dummy_nickname = 'aa' + str(i)
            dummy_email = 'aa' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url')
            Block.objects.create(user = self.fake_user, target = dummy)

        query_params = {
           'keyword': 'aa',
           'page': 1,
           'size': '',
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)


    #loginuser의 차단 목록 반환 실패(유효하지 않는 페이지 - 음수일 때)
    def test_get_block_list_invalid_page_negative(self):
        query_params = {
           'keyword': '',
           'page': -1,
           'size': 10,
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)


    #loginuser의 차단 목록 반환 실패(유효하지 않는 페이지 - 0일때)
    def test_get_block_list_invalid_page_zero(self):
        query_params = {
           'keyword': '',
           'page': 0,
           'size': 10
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)
    

    #loginuser의 차단 목록 반환 실패(유효하지 않는 페이지 - 빈칸일 때)
    def test_get_block_list_invalid_page_blank(self):
        query_params = {
           'keyword': '',
           'page': '',
           'size': 10
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)

    
    #loginuser의 차단 목록 반환 실패(유효하지 않는 페이지 - 존재하는 페이지보다 큰 수 일때)
    def test_get_block_list_invalid_page_big(self):
        query_params = {
           'keyword': '',
           'page': 10000,
           'size': 10,
        }

        query_string = urlencode(query_params)
    
        url = reverse('block:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)