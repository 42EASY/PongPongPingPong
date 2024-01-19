from rest_framework.views import APIView
from members.models import Members
from security.views import login_required
from django.http import HttpResponse
import qrcode
import pyotp
from io import BytesIO

# Create your views here.
class TwoFactorAuthView(APIView):
	@login_required
	def get(self, request):
		user = request.user
		secret_key = pyotp.random_base32()
		otp_url = f"otpauth://totp/PongPongPingPong:{user.email}?secret={secret_key}&issuer=PongPongPingPong"

		member = Members.objects.get(id=user.id)
		member.two_factor_secret = secret_key
		member.save()

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
		response = HttpResponse(content_type="image/png")
		img_io = BytesIO()
		img.save(img_io, 'PNG')
		img_io.seek(0)
		response.write(img_io.getvalue())

		return response


