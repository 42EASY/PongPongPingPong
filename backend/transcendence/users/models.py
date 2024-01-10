from django.db import models

# Create your models here.
class User(models.Model):
    key = models.BigAutoField(primary_key=True)
    nickname = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    is_2fa = models.BooleanField(null=True)
    image_url = models.CharField(max_length=255, null=True)
    refresh_token = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(null=True)
    modified_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        db_table = 'user'
