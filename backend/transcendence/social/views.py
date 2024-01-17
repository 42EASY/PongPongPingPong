from django.shortcuts import render
from rest_framework import permissions
from rest_framework.views import APIView
from django.http import JsonResponse
from members.models import Members
from social.models import Block

# Rest of your import statements

#TODO: block_view로 파일명 변경 및 분리하기
# Create your views here.
class BlockView(APIView):
    permissions_classes = [permissions.AllowAny]

    def post(self, request, user_id, base_user_id):
        #TODO: base_user_id 사용 대신 토큰 사용으로 변경
        try:
            target_user = Members.objects.get(id = user_id)
            base_user = Members.objects.get(id = base_user_id)

            Block.objects.create(user = base_user, target = target_user)
        
        except:
            return JsonResponse({
				'code': 400,
				'message':'Bad Request'
			}, status = 400)
        
        
        return JsonResponse({
            'code': 201,
            'message': 'created',
            'result': {}
        }, status = 201)
    


    def delete(self, request, user_id, base_user_id):
        #TODO: base_user_id 사용 대신 토큰 사용으로 변경
        try:
            target_user = Members.objects.get(id = user_id)
            base_user = Members.objects.get(id = base_user_id)

            block = Block.objects.get(user = base_user, target = target_user)

            block.delete()
        
        except:
            return JsonResponse({
				'code': 400,
				'message':'Bad Request'
			}, status = 400)
        
        
        return JsonResponse({
            'code': 200,
            'message': 'ok',
            'result': {}
        }, status = 200)
