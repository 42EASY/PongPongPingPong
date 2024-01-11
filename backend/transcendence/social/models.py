from django.db import models

# Create your models here.

class Friend(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='friends')
    target = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='friends_target')

    class Meta:
        db_table = 'friend'

class Block(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='blocks')
    target = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='blocked_by') 

    class Meta:
        db_table = 'block'
