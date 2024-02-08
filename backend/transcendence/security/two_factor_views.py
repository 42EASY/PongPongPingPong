from rest_framework.views import APIView
from members.models import Members
from security.views import login_required
from django.http import JsonResponse
import qrcode
import pyotp
import base64
from io import BytesIO

# Create your views here.
class TwoFactorAuthView(APIView):
	@login_required
	def get(self, request):
		user = request.user
		secret_key = pyotp.random_base32()
		otp_url = f"otpauth://totp/PongPongPingPong:{user.email}?secret={secret_key}&issuer=PongPongPingPong"

		try:
			member = Members.objects.get(id=user.id)
		except:
			return JsonResponse({
				'code' : 404,
				'message' : 'Not Found'
			}, status=404)
		member.two_factor_secret = secret_key
		member.save()

		try:
			# QR 코드 생성 및 반환
			qr = qrcode.QRCode(
				version=1,
				error_correction=qrcode.constants.ERROR_CORRECT_L,
				box_size=10,
				border=4,
			)
			qr.add_data(otp_url)
			qr.make(fit=True)

			# 이미지 스트림으로 변환
			img = qr.make_image(fill_color="black", back_color="white")
			img_io = BytesIO()
			img.save(img_io, 'PNG')
			img_io.seek(0)

			encoded_img = base64.b64encode(img_io.getvalue()).decode('utf-8')
		except:
			return JsonResponse({
				'code' : 400,
				'message' : 'Bad Request'
			}, status=400)
		return JsonResponse({
			'code':200,
			'message':'ok',
			'result': {
				'encoded_image': encoded_img
			}
		}, status=200)

	@login_required
	def post(self, request):
		try:
			otp_code = request.data.get("otp_code")
			user = request.user
			secret_key = user.two_factor_secret
			totp = pyotp.TOTP(secret_key)
		except:
			return JsonResponse({
				'code' : 400,
				'message' : 'Bad Request'
			}, status=400)
		if (totp.verify(otp_code)):
			return JsonResponse({
				'code':200,
				'message':'ok',
			}, status=200)
		else:
			return JsonResponse({
				'code':401,
				'message':'UnAuthorized',
			}, status=401)
