from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Members
import re

class MemberSerializer(serializers.ModelSerializer):
	class Meta:
		model = Members
		fields = ('nickname', 'is_2fa')

	def validate_nickname(self, value):
		 # 닉네임 길이 검증
		min_length = 1
		max_length = 15
		if not (min_length <= len(value) <= max_length):
			raise serializers.ValidationError(f"Nickname must be between {min_length} and {max_length} characters long")
		# 한글, 영어, 숫자만 포함하는지 검증
		if not re.match(r'^[가-힣a-zA-Z0-9]+$', value):
			raise serializers.ValidationError("Nickname can only contain Korean characters, English letters, and numbers")
		# 닉네임 필드에 대한 중복 체크를 수행하는 사용자 정의 유효성 검사 함수
		# Members 모델에서 닉네임이 이미 존재하는지 확인하고, 존재한다면 ValidationError을 발생시킵니다.
		if Members.objects.filter(nickname=value).exists():
			raise serializers.ValidationError("Duplicate nicknames")
		return value
