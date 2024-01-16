from django.test import TestCase, Client 
from members.models import Members
from django.urls import reverse

client = Client()

class BlockViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user_model = Members.objects.create(nickname = 'base_user', email = 'user@test.com', is_2fa = False,
                                      image_url = 'test_url', refresh_token = 'test_token')
        
        cls.target_model = Members.objects.create(nickname = 'target', email = 'target@test.com', is_2fa = False,
                                        image_url = 'test_url', refresh_token = 'test_token')

    #base_user가 target을 친구 차단 성공 테스트
    #TODO: 토큰 미적용하여 /api/v1/block/{user-id}/{base-user-id}로 사용, 추후 /api/v1/block/{user-id}로 변경 예정
    def test_post_block_success(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        #TODO: key를 id로 변경
        url = reverse('block:post', kwargs = {'user_id' : target_model.key, 'base_user_id' : user_model.key })
        response = client.post(url)

        self.assertEquals(response.json()['code'], 201)
        self.assertEquals(response.status_code, 201)


    #base_user가 없는 유저 친구 차단 실패 테스트    
    #TODO: 토큰 미적용하여 /api/v1/block/{user-id}/{base-user-id}로 사용, 추후 /api/v1/block/{user-id}로 변경 예정
    def test_post_block_no_user(self):
        user_model = Members.objects.get(nickname = 'base_user')

        #TODO: key를 id로 변경
        url = reverse('block:post', kwargs = {'user_id' : 100, 'base_user_id' : user_model.key})
        response = client.post(url)

        self.assertEquals(response.json()['code'], 400)
        self.assertEquals(response.status_code, 400)



