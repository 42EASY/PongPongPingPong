from django.test import TestCase
from members.models import Members
from .models import Block
from .models import Friend

# Create your tests here.
class BlockModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_model = Members.objects.create(nickname = 'base_user', email = 'user@test.com', is_2fa = False,
                                      image_url = 'test_url')
        
        cls.target_model = Members.objects.create(nickname = 'target', email = 'target@test.com', is_2fa = False,
                                        image_url = 'test_url')

    #setUp된 models 불러오기 테스트
    def test_get_block_model(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        self.assertEquals(user_model.email, 'user@test.com')
        self.assertEquals(target_model.email, 'target@test.com')


    #block 테이블에 user와 target 저장 테스트
    def test_block_add(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        block = Block.objects.create(user = user_model, target = target_model)
     
        self.assertEquals(block.user, user_model)
        self.assertEquals(block.target, target_model)
    
    #block 테이블에서 user와 target 삭제 테스트
    def test_block_delete(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        block = Block.objects.create(user = user_model, target = target_model)
        
        block.delete()

        self.assertEquals(Block.objects.all().exists(), False)


class FriendModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_model = Members.objects.create(nickname = 'base_user', email = 'user@test.com', is_2fa = False,
                                      image_url = 'test_url')
        
        cls.target_model = Members.objects.create(nickname = 'target', email = 'target@test.com', is_2fa = False,
                                        image_url = 'test_url')

    #setUp된 models 불러오기 테스트
    def test_get_friend_model(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        self.assertEquals(user_model.email, 'user@test.com')
        self.assertEquals(target_model.email, 'target@test.com')


    #friend 테이블에 user와 target 저장 테스트
    def test_friend_add(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        friend = Friend.objects.create(user = user_model, target = target_model)
     
        self.assertEquals(friend.user, user_model)
        self.assertEquals(friend.target, target_model)
    
    #friend 테이블에서 user와 target 삭제 테스트
    def test_friend_delete(self):
        user_model = Members.objects.get(nickname = 'base_user')
        target_model = Members.objects.get(nickname = 'target')

        friend = Friend.objects.create(user = user_model, target = target_model)
        
        friend.delete()

        self.assertEquals(Friend.objects.all().exists(), False)
