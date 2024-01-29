from rest_framework import serializers
from .models import Members

class MemberSerializer(serializers.ModelSerializer):
	class Meta:
		model = Members
		fields = ('nickname', 'is_2fa')
