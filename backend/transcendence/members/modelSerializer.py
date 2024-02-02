from rest_framework import serializers
from .models import Members

class MemberSerializer(serializers.ModelSerializer):
	class Meta:
		model = Members
		fields = ('nickname', 'is_2fa')

	def validate_nickname(self, value):
		# 닉네임 필드에 대한 중복 체크를 수행하는 사용자 정의 유효성 검사 함수
		# Members 모델에서 닉네임이 이미 존재하는지 확인하고, 존재한다면 ValidationError을 발생시킵니다.
		if Members.objects.filter(nickname=value).exists():
			raise serializers.ValidationError("Duplicate nicknames")
		return value
