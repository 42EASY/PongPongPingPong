from django.shortcuts import render
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from members.models import Members

# Rest of your import statements


# Create your views here.
class BlockView(APIView):
    permissions_classes = [permissions.AllowAny]

    #TODO: swagger 연동 확인
    def post(self, request, user_id):
        #TODO: 구현
        try:
            if Members.objects.filter(user_id = user_id).exist():
              target_user = Members.objects.get(user_id = user_id)  

            #TODO: 토큰 생성 및 반환해야하는데 그게 없으니까 토큰없이 user_id를 그냥 보내준다음에 나중에 토큰으로 고치기
            
        except:
            return HttpResponse(status = 400)
        return Response("example")
