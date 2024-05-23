from channels.db import database_sync_to_async
from members.models import Members
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from django.db import close_old_connections
from urllib.parse import parse_qs
from jwt import decode as jwt_decode, exceptions as jwt_exceptions
from django.conf import settings

@database_sync_to_async
def get_member_by_id(user_id):
	try:
		return Members.objects.get(id=user_id)
	except Members.DoesNotExist:
		return AnonymousUser()

class JwtAuthMiddleware(BaseMiddleware):
	def __init__(self, inner):
		self.inner = inner
	
	async def __call__(self, scope, receive, send):
		close_old_connections()
		token = None
		try:
			token = parse_qs(scope["query_string"].decode("utf8")).get("token", [None])[0]
			if not token:
				raise ValueError("Token not provided")
		except ValueError as e:
			# Token is invalid
			print(e)
			return None

		if token:
			try:
				UntypedToken(token)
				decoded_data = jwt_decode(token, settings.SIMPLE_JWT['SIGNING_KEY'], algorithms=["HS256"])
				scope["user"] = await get_member_by_id(decoded_data['user_id'])
			except (InvalidToken, TokenError, jwt_exceptions.ExpiredSignatureError, jwt_exceptions.DecodeError) as e:
				print(e)
				return None
		
		return await super().__call__(scope, receive, send)
		
def JwtAuthMiddlewareStack(inner):
	return JwtAuthMiddleware(AuthMiddlewareStack(inner))
