from django.db import models

# Create your models here.
class Game(models.Model):
    class GameOption(models.TextChoices):
        CLASSIC = 'CLASSIC', 'Classic'
        SPEED = 'SPEED', 'Speed'
        # 추가 옵션 필요 시 여기에 정의

    class GameMode(models.TextChoices):
        TWO_PLAYER = 'TWO_PLAYER', '2P Mode'
        NORMAL = 'NORMAL', 'Normal mode'
        TOURNAMENT = 'TOURNAMENT', 'Tournament mode'
        # 추가 모드 필요 시 여기에 정의

    id = models.BigAutoField(primary_key=True)
    game_option = models.CharField(max_length=100, choices=GameOption.choices)
    game_mode = models.CharField(max_length=100, choices=GameMode.choices)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)

    class Meta:
        db_table = 'game'

class Participant(models.Model):
    class Result(models.TextChoices):
        WIN = 'WIN', 'Win'
        LOSE = 'LOSE', 'Lose'
        # 추가 결과 필요 시 여기에 정의

    user_id = models.ForeignKey('members.Members', on_delete=models.CASCADE)
    game_id = models.ForeignKey(Game, on_delete=models.CASCADE)
    score = models.IntegerField(null=True)
    result = models.CharField(max_length=50, choices=Result.choices)

    class Meta:
        db_table = 'participant'
        constraints = [
            models.UniqueConstraint(fields=['user_id', 'game_id'], name='PK_PARTICIPANT')
        ]
