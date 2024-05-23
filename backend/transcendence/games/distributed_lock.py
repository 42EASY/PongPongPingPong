import time
import redis

class DistributedLock:
    def __init__(self):
        self.lock_key = "lock:game_queue"
        self.redis_conn = redis.StrictRedis(host='redis', port=6379, db=0)
        self.acquire_timeout = 10
        
    def acquire_lock(self):

        while True:
            try:
                if self.redis_conn.setnx(self.lock_key, "locked"):
                    return True
                
                time.sleep(0.1)
                self.acquire_timeout -= 0.1
                
                if self.acquire_timeout <= 0:
                    return False
            except:
                return False

    def release_lock(self):
        self.redis_conn.delete(self.lock_key)
