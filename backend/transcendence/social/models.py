from django.db import models

# Create your models here.

class Friend(models.Model):
    user = models.ForeignKey('members.Members', on_delete=models.CASCADE, related_name='friends')
    target = models.ForeignKey('members.Members', on_delete=models.CASCADE, related_name='friends_target')
    
    class Meta:
        db_table = 'friend'
        app_label = 'social'
        constraints = [
            models.UniqueConstraint(fields=['user', 'target'], name='PK_PARTICIPANT_FRIEND')
        ]

class Block(models.Model):
    user = models.ForeignKey('members.Members', on_delete=models.CASCADE, related_name='blocks')
    target = models.ForeignKey('members.Members', on_delete=models.CASCADE, related_name='blocked_by') 
    
    class Meta:
        db_table = 'block'
        app_label = 'social'
        constraints = [
            models.UniqueConstraint(fields=['user', 'target'], name='PK_PARTICIPANT_BLOCK')
        ]
