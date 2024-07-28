from django.shortcuts import render, get_object_or_404, get_list_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
from django.http import JsonResponse
from .models import Restaurant, NooriOfflineStore, NooriOnlineStore, AdongSearchHistory, NooriSearchHistory
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
from geopy.distance import geodesic


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

# 현재 위치 기준 추천 - 아동
# db에 위도 경도 없어서 현재 에러 발생
@api_view(['POST'])
def adong_send_address(request):
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')

    if road_name is None:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    # 도로명 주소에 기반하여 관련 주소를 찾음
    related_addresses = Restaurant.objects.filter(address__icontains=road_name)
    if not related_addresses.exists():
        return Response({"message": "해당 도로명 주소와 일치하는 주소가 없습니다."}, status=404)

    # 가까운 거리 계산을 위한 리스트 생성
    nearby_restaurants = []
    for restaurant in related_addresses:
        restaurant_location = (restaurant.latitude, restaurant.longitude)  # 가맹점의 위도와 경도
        user_location = (latitude, longitude)  # 사용자의 위도와 경도
        distance = geodesic(user_location, restaurant_location).meters  # 두 지점 간의 거리 계산
        nearby_restaurants.append((restaurant, distance))

    # 정렬 후 상위 5개를 선택
    nearby_restaurants.sort(key=lambda x: x[1])
    top_5_nearby = nearby_restaurants[:5]

    # 상위 5개 레스토랑을 직렬화
    serializer = RestaurantSerializer([restaurant[0] for restaurant in top_5_nearby], many=True)

    return Response(serializer.data)

# 검색 - 아동
@api_view(['POST'])
def adong_search(request):
    # 요청에서 검색 쿼리 추출
    query = request.data.get('query')
    if not query:
        return Response({"error": "검색 쿼리를 제공해야 합니다."}, status=status.HTTP_400_BAD_REQUEST)

    # gpt 답변 넣고 가져오는 기능 추가 필요
    # 외부 모듈의 검색 함수 호출 기능 추가
    # search_results = perform_search(query)

    # 결과를 클라이언트에 반환
    # return Response(search_results, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_200_OK)

# 검색 기록 추천 - 아동
@api_view(['GET'])
def adong_search_recommendations(request):
    # 데이터베이스에서 검색 기록 가져오기
    search_records = AdongSearchHistory.objects.all().order_by('-timestamp')[:10]  # 최근 10개 검색 기록

    # 검색 기록을 리스트로 변환
    search_history = [record.query for record in search_records]

    if not search_history:
        return Response({"message": "검색 기록이 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    # GPT 모듈에 검색 기록 전달
    # gpt_response = get_gpt_response(search_history)

    # 결과를 클라이언트에 반환
    # return Response(gpt_response, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_200_OK)

# 현재 위치 기준 추천 - 문화
@api_view(['POST'])
def noori_send_address(request):
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')

    if road_name is None:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    # 도로명 주소에 기반하여 관련 주소를 찾음
    related_online_stores = NooriOnlineStore.objects.filter(address__icontains=road_name)
    related_offline_stores = NooriOfflineStore.objects.filter(address__icontains=road_name)
    combined_infos = list(related_online_stores) + list(related_offline_stores)

    if not combined_infos:
        return Response({"message": "해당 도로명 주소와 일치하는 주소가 없습니다."}, status=404)

    # 가까운 거리 계산을 위한 리스트 생성
    nearby_stores = []
    for store in combined_infos:
        store_location = (store.latitude, store.longitude)  # 스토어의 위도와 경도
        user_location = (latitude, longitude)  # 사용자의 위도와 경도
        distance = geodesic(user_location, store_location).meters  # 두 지점 간의 거리 계산
        nearby_stores.append((store, distance))

    # 거리 기준으로 정렬 후 상위 5개를 선택
    nearby_stores.sort(key=lambda x: x[1])
    top_5_nearby = nearby_stores[:5]

    # 직렬화할 데이터 리스트 생성
    serializer_data = []
    for store, _ in top_5_nearby:
        if isinstance(store, NooriOnlineStore):
            serializer = NooriOnlineInfosSerializer(store)
        elif isinstance(store, NooriOfflineStore):
            serializer = NooriOfflineInfosSerializer(store)
        serializer_data.append(serializer.data)

    return Response(serializer_data)


# 검색 - 문화
@api_view(['POST'])
def noori_search(request):
    # 요청에서 검색 쿼리 추출
    query = request.data.get('query')
    if not query:
        return Response({"error": "검색 쿼리를 제공해야 합니다."}, status=status.HTTP_400_BAD_REQUEST)

    # gpt 답변 넣고 가져오는 기능 추가 필요
    # 외부 모듈의 검색 함수 호출 기능 추가
    # search_results = perform_search(query)

    # 결과를 클라이언트에 반환
    # return Response(search_results, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_200_OK)

# 검색 기반 추천 - 문화
@api_view(['GET'])
def noori_search_recommendations(request):
    # 데이터베이스에서 검색 기록 가져오기
    search_records = NooriSearchHistory.objects.all().order_by('-timestamp')[:10]  # 최근 10개 검색 기록

    # 검색 기록을 리스트로 변환
    search_history = [record.query for record in search_records]

    if not search_history:
        return Response({"message": "검색 기록이 없습니다."}, status=status.HTTP_404_NOT_FOUND)

    # GPT 모듈에 검색 기록 전달
    # gpt_response = get_gpt_response(search_history)

    # 결과를 클라이언트에 반환
    # return Response(gpt_response, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_200_OK)