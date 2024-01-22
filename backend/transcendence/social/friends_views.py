from django.shortcuts import render
from rest_framework import permissions
from rest_framework.views import APIView
from django.http import JsonResponse
from members.models import Members
from social.models import Friend
from social.models import Block
from django.core.paginator import Paginator

class FriendsView(APIView):
    permissions_classes = [permissions.AllowAny]

    #TODO: base_user_id 사용 대신 토큰 사용으로 변경
    def post(self, request, user_id, base_user_id):
        try:
            target_user = Members.objects.get(id = user_id)
            base_user = Members.objects.get(id = base_user_id)

            if (Block.objects.filter(user = base_user, target = target_user).count() > 0):
                return JsonResponse({
                    'code': 409,
                    'message': 'Conflict'
                }, status = 409)
      
        except:
            return JsonResponse({
                'code': 404,
                'message': 'Bad Request'
            }, status = 404)
  
        try:
            Friend.objects.create(user = base_user, target = target_user)
        
        except:
            return JsonResponse({
                'code': 400,
                'message': 'Bad Request'
            }, status = 400)
        
        return JsonResponse({
            'code': 201,
            'message': 'Bad Request'
        }, status = 201)
    

    def delete(self, request, user_id, base_user_id):
        #TODO: base_user_id 사용 대신 토큰 사용으로 변경
        try:
            target_user = Members.objects.get(id = user_id)
            base_uer = Members.objects.get(id = base_user_id)

        except:
            return JsonResponse({
                'code': 404,
                'message': 'Not Found'
            }, status = 404)
        

        try:
            friends = Friend.objects.get(user = base_uer, target = target_user)

            friends.delete()

        except:
            return JsonResponse({
                'code': 400,
                'message': 'Bad Request'
            }, status = 400)
        
    
        return JsonResponse({
            'code': 200,
            'message': 'ok',
            'result' : {}
        }, status = 200)