from django.db import models

# Create your models here.
class Tournament(models.Model):
	key = models.BigAutoField(primary_key=True)

class TournamentGame(models.Model):
    class Round(models.TextChoices):
        FINAL = 'FINAL', 'Final'
        SEMI_FINAL = 'SEMI_FINAL', 'Semi Final'
        # 추가 라운드 필요 시 여기에 정의

    game_id = models.ForeignKey('games.Game', on_delete=models.CASCADE)
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    round = models.CharField(max_length=50, choices=Round.choices)

    class Meta:
        db_table = 'tournament_game'
        constraints = [
            models.UniqueConstraint(fields=['game_id', 'tournament_id'], name='PK_TOURNAMENT_GAME')
        ]
