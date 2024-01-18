from django.shortcuts import render
from rest_framework import permissions
from rest_framework.views import APIView
from django.http import JsonResponse
from members.models import Members
from social.models import Block
from django.core.paginator import Paginator

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


    def get(self, request):
        keyword = request.GET.get('keyword', None)
        page = request.GET.get('page', None)
        size = request.GET.get('size', None)
        #TODO: 토큰이 적용되면, query string대신 token으로 user_id 받기 
        user_id = request.GET.get('user_id', None)

        if (page == None or page == '' or user_id == None or user_id == ''):
            return JsonResponse({
				'code': 400,
				'message':'NULL Error'
			}, status = 400)

        #만일 size값이 없으면 size는 10으로 지정
        if (size == None or size == ''):
            size = 10
    
        data = []
       
        try:
            base_user = Members.objects.get(id = user_id)

            #keyword가 비어있는 경우 전체 리스트 반환
            if (keyword == None or keyword == ''):
                block_list = Block.objects.filter(user = base_user).order_by('target')
            else:
                block_list = Block.objects.filter(user = base_user, target__nickname__icontains = keyword).order_by('target')

        except:
            return JsonResponse({
			    'code': 400,
				'message':'Model Error'
			}, status = 400)

        try :
            paginator = Paginator(block_list, size)
            total_page = paginator.num_pages
        except:
            return JsonResponse({
			    'code': 400,
				'message':'Paginator Error'
			}, status = 400)
            
        
        #total page의 범위를 벗어난 page를 가지고자 한 경우
        if (int(total_page) < int(page)) or (int(page) <= 0):
            return JsonResponse({
			    'code': 400,
				'message':'Page Index Error'
			}, status = 400)
        
        try:
            page_obj = paginator.get_page(page)
        except:
            return JsonResponse({
                'code': 400,
                'message': 'Get Page Error'
            }, status = 400)

        try:
            for block in page_obj:
                user_data = {
                    'user_id' : block.target.id,
                    'image_url' : block.target.image_url,
                    'nickname' : block.target.nickname
                }
                data.append(user_data)
        except:
            return JsonResponse({
                'code': 400,
                'message' : 'Input Data Error'
            }, status = 400)


        result = {
            'data' : data,
            'total_page' : total_page
        }

        return JsonResponse({
            'code': 200,
            'message': 'ok',
            'result' : result
        }, status = 200)

        # except:
        #     return JsonResponse({
		# 	    'code': 400,
		# 		'message':'Bad Request'
		# 	}, status = 400)
        

