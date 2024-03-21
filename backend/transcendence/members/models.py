from django.db import models
from django.forms.models import model_to_dict

# Create your models here.
class Members(models.Model):

    class Status(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        OFFLINE = 'OFFLINE', 'Offline'
        IN_GAME = 'IN_GAME', 'In_Game'

    id = models.BigAutoField(primary_key=True)
    nickname = models.CharField(max_length=255, unique=True)
    email = models.CharField(max_length=255)
    is_2fa = models.BooleanField(null=True)
    image_url = models.CharField(max_length=255, null=True)
    two_factor_secret = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(null=True)
    modified_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)
    status = models.CharField(max_length = 100, choices = Status.choices, default = Status.OFFLINE)

    class Meta:
        db_table = 'members'
        app_label = 'members'

    def __str__(self):
        return str(model_to_dict(self))
