from django.test import TestCase
from django.core.cache import cache

class RedisTest(TestCase):
   
    def test_redis(self):
        cache.set('test-key', 'test-value')
        
        value = cache.get('test-key')
        
        self.assertEquals(value, 'test-value')