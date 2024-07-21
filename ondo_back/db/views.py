from django.shortcuts import render, get_object_or_404, get_list_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
from django.http import JsonResponse
from .models import Restaurant, NooriOfflineStore, NooriOnlineStore
from .serializers import RestaurantSerializer, NooriOnlineInfosSerializer, NooriOfflineInfosSerializer
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import csv
import json
import os
from django.conf import settings
import chardet
import pandas as pd


@api_view(['GET'])
def save_adong_infos(request):
    file_path = os.path.join(settings.BASE_DIR, 'restaurant_data.csv')
    if not os.path.exists(file_path):
        return Response({"error": "CSV file not found"}, status=status.HTTP_404_NOT_FOUND)

    with open(file_path, mode='r', encoding='utf-8') as file:
        # 수동으로 헤더 설정
        fieldnames = ['가맹점명', '소재지도로명주소', '카테고리', '메뉴']
        reader = csv.DictReader(file, fieldnames=fieldnames)
        next(reader)  # 헤더 행을 건너뜁니다.

        for row in reader:
            try:
                menu_items = row['메뉴'].split(';')
                menu_dict = {}
                for item in menu_items:
                    if ':' in item:
                        name, price = item.split(':', 1)
                        menu_dict[name.strip()] = price.strip()
                
                # JSON 데이터 저장 시 ensure_ascii=False 옵션 사용
                menu_json = json.dumps(menu_dict, ensure_ascii=False)
                Restaurant.objects.create(
                    name=row['가맹점명'],
                    address=row['소재지도로명주소'],
                    category=row['카테고리'],
                    menu=menu_json
                )
            except KeyError as e:
                return Response({"error": f"Missing column in CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"success": "Data has been successfully saved"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def save_noori_online_infos(request):
    file_path = os.path.join(settings.BASE_DIR, '한국문화예술위원회_문화누리카드_온라인_가맹점_목록_20211222.csv')

    try:
        with open(file_path, newline='', encoding='euc-kr') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                NooriOnlineStore.objects.create(
                    name=row['가맹점명'],
                    address=row['주소'],
                    phone=row['전화번호'],
                    category=row['분류'],
                )
        return Response({'status': 'success', 'message': 'Data saved successfully'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)



@api_view(['GET'])
def save_noori_offline_infos(request):
    file_path = os.path.join(settings.BASE_DIR, '한국문화예술위원회_문화누리카드_오프라인_가맹점_목록_20211222.csv')

    # 여러 인코딩 시도
    encodings = ['utf-8', 'euc-kr', 'cp949']

    for encoding in encodings:
        try:
            with open(file_path, newline='', encoding=encoding) as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    NooriOfflineStore.objects.create(
                        name=row['가맹점명'],
                        address=row['주소'],
                        category=row['분류'],
                    )
            return Response({'status': 'success', 'message': f'Data saved successfully with encoding: {encoding}'})
        except UnicodeDecodeError as e:
            continue  # 다음 인코딩 시도
        except KeyError as e:
            return Response({'status': 'error', 'message': f'Missing column: {e}'}, status=400)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)
    
    return Response({'status': 'error', 'message': 'Failed to read CSV file with all tried encodings'}, status=500)


api_view(['GET'])
def adong_infos(request):
    restaurants = Restaurant.objects.all()
    serializer = RestaurantSerializer(restaurants, many=True)
    return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)


api_view(['GET'])
def noori_online_infos(request):
    onlineInfos = NooriOnlineStore.objects.all()
    serializer = NooriOnlineInfosSerializer(onlineInfos, many=True)
    return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)


api_view(['GET'])
def noori_offline_infos(request):
    offlineInfos = NooriOfflineStore.objects.all()
    serializer = NooriOfflineInfosSerializer(offlineInfos, many=True)
    return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)