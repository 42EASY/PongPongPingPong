from django.http import JsonResponse
from members.models import Members
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

class MyJwtView(APIView):
	def post(self, request):
		# TODO: 헤더에서 가져오도록 해야함.
		received_refresh_token = request.data.get('refresh_token')

		try:
			token = Members.objects.get(refresh_token=received_refresh_token)
		except Members.DoesNotExist:
			return JsonResponse({
				'code':403,
				'message':'Forbidden'
			}, status=403)

		# 새로운 access_token 생성
		refresh = RefreshToken(token.refresh_token)
		new_access_token = str(refresh.access_token)

		return JsonResponse({
				'code':200,
				'message':'ok',
				'result': {
					'access_token': new_access_token,
				}
			}, status=200)
