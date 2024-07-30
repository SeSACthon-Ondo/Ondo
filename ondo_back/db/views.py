import math

from django.shortcuts import render, get_object_or_404, get_list_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
from django.http import JsonResponse

from .gpt_service import get_recommendations_from_csv
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
from django.core.files.base import ContentFile


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

def calculate_latitude_longitude_delta(radius_m, latitude):
    # 1도 위도는 약 111,000m
    latitude_delta = radius_m / 111000  # 반경을 위도로 변환
    longitude_delta = radius_m / (111000 * math.cos(math.radians(latitude)))  # 반경을 경도로 변환
    return latitude_delta, longitude_delta

def find_nearby_restaurants(latitude, longitude, radius_m):
    # 반경에 따른 위도 및 경도 차이 계산
    latitude_delta, longitude_delta = calculate_latitude_longitude_delta(radius_m, latitude)

    # 1차 필터링: 위도, 경도 기준으로 반경 내 가맹점 검색
    nearby_restaurants = Restaurant.objects.filter(
        latitude__gte=latitude - latitude_delta,
        latitude__lte=latitude + latitude_delta,
        longitude__gte=longitude - longitude_delta,
        longitude__lte=longitude + longitude_delta
    )

    # 직렬화 과정: 모든 가맹점 반환
    serializer = RestaurantSerializer(nearby_restaurants, many=True)
    serialized_restaurants = serializer.data  # 직렬화된 데이터

    return serialized_restaurants  # 가맹점 리스트 반환
# 주변 문화 센터 가져오기
def find_nearby_stores(latitude, longitude, radius_m):

    latitude_delta, longitude_delta = calculate_latitude_longitude_delta(radius_m, latitude)

    # 1차 필터링: 위도, 경도 기준으로 반경 내 온라인 및 오프라인 가맹점 검색
    nearby_online_stores = NooriOnlineStore.objects.filter(
        latitude__gte=latitude - latitude_delta,
        latitude__lte=latitude + latitude_delta,
        longitude__gte=longitude - longitude_delta,
        longitude__lte=longitude + longitude_delta
    )

    nearby_offline_stores = NooriOfflineStore.objects.filter(
        latitude__gte=latitude - latitude_delta,
        latitude__lte=latitude + latitude_delta,
        longitude__gte=longitude - longitude_delta,
        longitude__lte=longitude + longitude_delta
    )

    # 직렬화 과정: 모든 가맹점 반환
    online_serializer = RestaurantSerializer(nearby_online_stores, many=True)
    offline_serializer = RestaurantSerializer(nearby_offline_stores, many=True)

    serialized_online_stores = online_serializer.data  # 직렬화된 온라인 가맹점 데이터
    serialized_offline_stores = offline_serializer.data  # 직렬화된 오프라인 가맹점 데이터

    # 두 가지 가맹점 리스트를 합쳐서 반환
    return {
        "online_stores": serialized_online_stores,
        "offline_stores": serialized_offline_stores
    }

# 현재 위치 기준 추천 - 아동
# db에 위도 경도 없어서 현재 에러 발생
@api_view(['POST'])
def adong_send_address(request):
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    radius_m = 300  # 반경 300m로 지정

    # 입력 값 유효성 검사
    if not road_name:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    # 주변 음식점 검색
    serialized_restaurants = find_nearby_restaurants(latitude, longitude, radius_m)

    # 검색 기록 가져오기
    search_history = list(AdongSearchHistory.objects.values_list('query', flat=True).order_by('-timestamp')[:10])

    # CSV 파일 생성
    csv_file_path = 'user_data.csv'
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['User Location', 'Search History', 'Radius', 'Restaurant Candidates'])

        # 유저 위치 정보, 검색 기록, 반경, 음식점 리스트 추가
        restaurant_names = [restaurant['name'] for restaurant in serialized_restaurants]
        writer.writerow([f"{latitude}, {longitude}", search_history, radius_m, restaurant_names])

    # GPT 모듈에 CSV 파일 전달
    with open(csv_file_path, 'rb') as f:
        csv_content = ContentFile(f.read())
        gpt_response = get_gpt_response(
            user_location=(latitude, longitude),
            search_history=search_history,
            radius=radius_m,
            restaurant_candidates=csv_content
        )

    # 임시 CSV 파일 삭제
    os.remove(csv_file_path)

    # GPT 모듈의 JSON 응답 처리
    if isinstance(gpt_response, dict) and 'restaurants' in gpt_response:
        response_data = {
            "gpt_restaurants": gpt_response['restaurants']
        }
    else:
        response_data = {
            "gpt_restaurants": [],
            "message": "유효한 가맹점 정보가 없습니다."
        }

    return Response(response_data)

# 검색 - 아동
@api_view(['POST'])
def adong_search(request):
    # 요청에서 검색 쿼리 추출
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    query = request.data.get('query')
    radius_m = 300  # 반경 300m로 지정

    # 입력 값 유효성 검사
    if not road_name:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    if not query:
        return Response({"error": "검색 쿼리를 제공해야 합니다."}, status=400)

    # 주변 음식점 검색
    serialized_restaurants = find_nearby_restaurants(latitude, longitude, radius_m)

    # CSV 파일 생성
    csv_file_path = 'user_data.csv'
    try:
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['user_location', 'user_cuisine', 'restaurant_candidates'])

            # 유저 위치 정보와 검색 기록, 음식점 리스트 추가
            restaurant_names = [restaurant['name'] for restaurant in serialized_restaurants]
            writer.writerow([f"{latitude}, {longitude}", query, ', '.join(restaurant_names)])  # 리스트를 문자열로 변환하여 저장

        # get_recommendations_from_csv 함수 호출
        gpt_response = get_recommendations_from_csv(csv_file_path)

    finally:
        # 임시 CSV 파일 삭제
        if os.path.exists(csv_file_path):
            os.remove(csv_file_path)

    # GPT 모듈의 JSON 응답 처리
    if isinstance(gpt_response, dict) and 'restaurants' in gpt_response:
        response_data = {
            "gpt_restaurants": gpt_response['restaurants']
        }
        # 검색 기록 저장
        AdongSearchHistory.objects.create(query=query)  # 검색 쿼리를 데이터베이스에 저장
    else:
        response_data = {
            "gpt_restaurants": [],
            "message": "유효한 가맹점 정보가 없습니다."
        }

    return Response(response_data)


# 현재 위치 기준 추천 - 문화
@api_view(['POST'])
def noori_send_address(request):
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    radius_m = 300 # 반경 300m로 지정

    if road_name is None:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    serialized_stores = find_nearby_stores(latitude, longitude, radius_m)

    # 검색 기록을 데이터베이스에서 가져오기
    search_records = AdongSearchHistory.objects.all().order_by('-timestamp')[:10]  # 최근 10개 검색 기록
    search_history = [record.query for record in search_records]

    # CSV 파일 생성
    csv_file_path = 'user_data.csv'
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['User Location', 'Search History', 'Radius', 'Store Candidates'])

        # 유저 위치 정보, 검색 기록, 반경, 음식점 리스트 추가
        store_names = [store['name'] for store in serialized_stores]  # 음식점 이름 리스트
        writer.writerow([f"{latitude}, {longitude}", search_history, radius_m, store_names])

    # GPT 모듈에 CSV 파일 전달
    with open(csv_file_path, 'rb') as f:
        csv_content = ContentFile(f.read())
        gpt_response = get_gpt_response(user_location=(latitude, longitude), search_history=search_history,
                                        radius=radius_m, store_candidates=csv_content)

    # 임시 CSV 파일 삭제
    os.remove(csv_file_path)

    # GPT 모듈의 JSON 응답 처리
    # 입출력 형태 맞춰야함
    if isinstance(gpt_response, dict) and 'stores' in gpt_response:
        # 프론트엔드로 응답할 가맹점 정보
        response_data = {
            "gpt_stores": gpt_response['stores']  # GPT에서 받은 가맹점 정보
        }
    else:
        response_data = {
            "gpt_stores": [],  # GPT 응답이 없을 경우 빈 리스트
            "message": "유효한 가맹점 정보가 없습니다."
        }

    return Response(response_data)


# 검색 - 문화
@api_view(['POST'])
def noori_search(request):
    # 요청에서 검색 쿼리 추출
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    query = request.data.get('query')
    radius_m = 300  # 반경 300m로 지정

    if road_name is None:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    if not query:
        return Response({"error": "검색 쿼리를 제공해야 합니다."}, status=status.HTTP_400_BAD_REQUEST)

    serialized_stores = find_nearby_stores(latitude, longitude, radius_m)

    # CSV 파일 생성
    csv_file_path = 'user_data.csv'
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['User Location', 'Search', 'Radius', 'Store Candidates'])

        # 유저 위치 정보, 검색 기록, 반경, 음식점 리스트 추가
        store_names = [store['name'] for store in serialized_stores]  # 음식점 이름 리스트
        writer.writerow([f"{latitude}, {longitude}", query, radius_m, store_names])

    # GPT 모듈에 CSV 파일 전달
    with open(csv_file_path, 'rb') as f:
        csv_content = ContentFile(f.read())
        gpt_response = get_gpt_response(user_location=(latitude, longitude), Search=query,
                                        radius=radius_m, store_candidates=csv_content)

    # 임시 CSV 파일 삭제
    os.remove(csv_file_path)

    # GPT 모듈의 JSON 응답 처리
    # 입출력 형태 맞춰야함
    if isinstance(gpt_response, dict) and 'stores' in gpt_response:
        # 프론트엔드로 응답할 가맹점 정보
        response_data = {
            "gpt_stores": gpt_response['stores']  # GPT에서 받은 가맹점 정보
        }
        # 검색 기록 저장
        NooriSearchHistory.objects.create(query=query)  # 검색 쿼리를 데이터베이스에 저장
    else:
        response_data = {
            "gpt_stores": [],  # GPT 응답이 없을 경우 빈 리스트
            "message": "유효한 가맹점 정보가 없습니다."
        }

    return Response(response_data)