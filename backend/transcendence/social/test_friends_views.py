from django.test import TestCase, Client
from members.models import Members
from social.models import Friend
from social.models import Block
from django.urls import reverse
from urllib.parse import urlencode

client = Client()

class FriendsViewTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_model = Members.objects.create(nickname = 'base_user', email = 'user@test.com', is_2fa = False,
                                      image_url = 'test_url', refresh_token = 'test_token')
        
        cls.target_model = Members.objects.create(nickname = 'target', email = 'target@test.com', is_2fa = False,
                                        image_url = 'test_url', refresh_token = 'test_token')

    #base_user가 target을 친구 추가 성공 테스트
    #TODO: 토큰 미적용하여 /api/v1/friends/{user-id}/{base-user-id}로 사용, 추후 /api/v1/friends/{user-id}로 변경 예정
    def test_post_friends_success(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        url = reverse('friends:post', kwargs = {'user_id' : target_model.id, 'base_user_id' : user_model.id })
        response = client.post(url)

        self.assertEquals(response.json()['code'], 201)
        self.assertEquals(response.status_code, 201)


    #target user가 없는 유저 친구 추가 실패 테스트    
    #TODO: 토큰 미적용하여 /api/v1/friends/{user-id}/{base-user-id}로 사용, 추후 /api/v1/friends/{user-id}로 변경 예정
    def test_post_friends_no_target_user(self):
        user_model = Members.objects.get(nickname = 'base_user')

        url = reverse('friends:post', kwargs = {'user_id' : 100, 'base_user_id' : user_model.id})
        response = client.post(url)

        self.assertEquals(response.json()['code'], 404)
        self.assertEquals(response.status_code, 404)


    #base_user가 target를 친구 차단 했을 때의 친구 추가 실패 테스트 
    #TODO: 토큰 미적용하여 /api/v1/friends/{user-id}/{base-user-id}로 사용, 추후 /api/v1/friends/{user-id}로 변경 예정
    def test_post_friends_block_friend(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        Block.objects.create(user = user_model, target = target_model)

        url = reverse('friends:post', kwargs = {'user_id' : target_model.id, 'base_user_id' : user_model.id })
        response = client.post(url)

        self.assertEquals(response.json()['code'], 409)
        self.assertEquals(response.status_code, 409)

    #base_user가 친구 추가된 target을 친구 삭제 성공테스트
    #TODO: 토큰 미적용하여 /api/v1/friends/{user-id}/{base-user-id}로 사용, 추후 /api/v1/friends/{user-id}로 변경 예정
    def test_delete_friends_success(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        Friend.objects.create(user = user_model, target = target_model)

        url = reverse('friends:delete', kwargs = {'user_id' : target_model.id, 'base_user_id' : user_model.id})
        response = client.delete(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)

    #target 유저가 없는 친구 삭제 실패 테스트
    #TODO: 토큰 미적용하여 /api/v1/friends/{user-id}/{base-user-id}로 사용, 추후 /api/v1/friends/{user-id}로 변경 예정
    def test_delete_friends_no_user(self):
        user_model = Members.objects.get(nickname = 'base_user')

        url = reverse('friends:delete', kwargs = {'user_id' : 100, 'base_user_id' : user_model.id})
        response = client.delete(url)

        self.assertEquals(response.json()['code'], 404)
        self.assertEquals(response.status_code, 404)
    

    #user의 친구 목록 반환 테스트(keyword x)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_no_keyword(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': '',
           'page': 1,
           'size': 5,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)



    #user의 친구 목록 반환 테스트(keyword o)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_keyword(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        tmp = Members.objects.create(nickname = 'tmp', email = 'tmp@test.com', is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
        Friend.objects.create(user = user_model, target = tmp)

        query_params = {
           'keyword': 't',
           'page': 1,
           'size': 1,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)
        self.assertEquals(response.json()['result']['total_page'], 1)
        

    #user의 친구 목록 반환 실패(유효하지 않는 size - 음수일 때)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_invalid_size(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': '',
           'page': 1,
           'size': -1,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)

    #user의 친구 목록 반환 실패(유효하지 않는 size - 0일때)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_invalid_size_zero(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': '',
           'page': 1,
           'size': 0,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)


    #user의 친구 목록 반환 성공(size가 빈칸일 때)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_invalid_size_null(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'aa' + str(i)
            dummy_email = 'aa' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': 'aa',
           'page': 1,
           'size': '',
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 200)
        self.assertEquals(response.status_code, 200)
    

    #user의 친구 목록 반환 실패(유효하지 않는 페이지 - 음수일 때)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_invalid_page_negative(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': '',
           'page': -1,
           'size': 10,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)


    #user의 친구 목록 반환 실패(유효하지 않는 페이지 - 0일때)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_invalid_page_zero(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': '',
           'page': 0,
           'size': 10,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)


    #user의 친구 목록 반환 실패(유효하지 않는 페이지 - 빈칸일 때)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_invalid_page_blank(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': '',
           'page': '',
           'size': 10,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)

    
    #user의 차단 목록 반환 실패(유효하지 않는 페이지 - 존재하는 페이지보다 큰 수 일때)
    #TODO: /api/v1/friends?keyword={keyword}&page={page}&size={size}&user_id={user_id} 에서 user_id 삭제 예정
    def test_get_friends_list_invalid_page_big(self):
        user_model = Members.objects.get(nickname = 'base_user')

        for i in range(5):
            dummy_nickname = 'dummy' + str(i)
            dummy_email = 'dummy' + str(i) + '@test.com'
            dummy = Members.objects.create(nickname = dummy_nickname, email = dummy_email, is_2fa = False, image_url = 'test_url', refresh_token = 'test_token')
            Friend.objects.create(user = user_model, target = dummy)

        query_params = {
           'keyword': '',
           'page': 10000,
           'size': 10,
           'user_id': user_model.id,
        }

        query_string = urlencode(query_params)
    
        url = reverse('friends:get') + '?' + query_string
        response = client.get(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)
