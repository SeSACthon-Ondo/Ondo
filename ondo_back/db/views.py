import math

from django.db.models import Q
from django.shortcuts import render, get_object_or_404, get_list_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
from django.http import JsonResponse
import random

from .gpt_service_adong_search import get_recommendations_from_csv
from .gpt_service_adong_address import get_recommendations_from_history
from .nutrient_recommend import get_nutrient_recommend
from .gpt_service_noori_search import get_noori_from_csv
from .favorite_recommend import get_favorite_recommend
from .models import Restaurant, NooriOfflineStore, NooriOnlineStore, AdongSearchHistory, NooriSearchHistory, SearchResult, Review
from .serializers import RestaurantSerializer, NooriOnlineInfosSerializer, NooriOfflineInfosSerializer, ReviewSerializer
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
import re


@api_view(['GET'])
def save_adong_infos(request):
    file_path = os.path.join(settings.BASE_DIR, 'filtered_restaurant_data_광진구.csv')
    if not os.path.exists(file_path):
        return Response({"error": "CSV file not found"}, status=status.HTTP_404_NOT_FOUND)

    with open(file_path, mode='r', encoding='utf-8') as file:
        # 수동으로 헤더 설정
        fieldnames = ['가맹점명', '소재지도로명주소', '위도', '경도', '카테고리', '메뉴']
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
                    latitude=row['위도'],
                    longitude=row['경도'],
                    category=row['카테고리'],
                    menu=menu_json
                )
            except KeyError as e:
                return Response({"error": f"Missing column in CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"success": "Data has been successfully saved"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def save_noori_online_infos(request):
    file_path = os.path.join(settings.BASE_DIR, 'filtered_noori_online_data_서울.csv')

    try:
        with open(file_path, newline='', encoding='utf-8') as csvfile:
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
    file_path = os.path.join(settings.BASE_DIR, 'filtered_noori_offline_data_서울.csv')

    try:
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                NooriOfflineStore.objects.create(
                    name=row['가맹점명'],
                    address=row['주소'],
                    category=row['분류'],
                )
        return Response({'status': 'success', 'message': 'Data saved successfully'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)


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
    latitude_delta = radius_m / 111000
    longitude_delta = radius_m / (111000 * math.cos(math.radians(latitude)))
    return latitude_delta, longitude_delta

def find_nearby_restaurants(latitude, longitude, radius_m):
    latitude_delta, longitude_delta = calculate_latitude_longitude_delta(radius_m, latitude)
    nearby_restaurants = Restaurant.objects.filter(
        latitude__gte=latitude - latitude_delta,
        latitude__lte=latitude + latitude_delta,
        longitude__gte=longitude - longitude_delta,
        longitude__lte=longitude + longitude_delta
    )
    serializer = RestaurantSerializer(nearby_restaurants, many=True)
    return serializer.data

def extract_district(road_name):
    match = re.search(r'(.+구|.+군)', road_name)
    return match.group(0) if match else None

def find_nearby_stores_by_road_name(road_name):
    district = extract_district(road_name)
    if not district:
        return []

    nearby_stores = NooriOfflineStore.objects.filter(Q(address__icontains=district))
    serializer = NooriOfflineInfosSerializer(nearby_stores, many=True)
    return serializer.data

def review_search(serialized_restaurants):
    for rest in serialized_restaurants:
        id = rest['id']
        reviews = Review.objects.filter(restaurant_id=id)
        s_reviews = ReviewSerializer(reviews, many=True)
        rest['reviews'] = s_reviews.data

def convert_string_(input_string):
    new_string = input_string.replace("음식점 이름:", '"name": "')
    new_string = new_string.replace("음식점 카테고리:", '"category": "')
    new_string = new_string.replace("음식점 위치:", '"address": "')
    new_string = new_string.replace("음식점 메뉴:", '"menu": "')
    new_string = new_string.replace("음식점 리뷰:", '"review": "')
    new_string = new_string.replace(",\n    ", '",\n    ')
    new_string = new_string.replace(',\n   }', '"\n   }')
    return new_string

def convert_recommend(input_string):
    new_string = input_string.replace("[\n   {\n      추천 메뉴 :", '[\n   {\n      "recommend": "')
    new_string = new_string.replace("\n   },\n   {\n      추천 메뉴 :", ',')
    new_string = new_string.replace("\n   }\n]", '"\n   }\n]')
    return new_string

@api_view(['POST'])
def adong_send_address(request):
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    radius_m = 500  # 반경 777m로 지정

    if not road_name:
        return Response({"error": "도로명이 필요합니다."}, status=400)
    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    serialized_restaurants = find_nearby_restaurants(latitude, longitude, radius_m)
    review_search(serialized_restaurants)

    if not serialized_restaurants:
        return Response(None, status=204)

    search_history = list(AdongSearchHistory.objects.values_list('query', flat=True).order_by('-timestamp')[:10])

    csv_file_path = './test.csv'
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['user_location', 'user_cuisine_history', 'restaurant_candidates', 'review_data'])

        restaurant_info_list = []
        for restaurant in serialized_restaurants:
            restaurant_info = {
                '가맹점명': restaurant['name'],
                '카테고리': restaurant['category'],
                '소재지도로명주소': restaurant['address'],
                '메뉴': restaurant['menu'],
                '리뷰': restaurant['reviews'][:3]
            }
            restaurant_info_list.append(restaurant_info)

        review_info_list = []
        for res in serialized_restaurants:
            result = {
                '가맹점명': res['name'],
                '리뷰': res['reviews'][:3]
            }
            review_info_list.append(result)

        restaurant_json_data = json.dumps(restaurant_info_list, ensure_ascii=False)
        review_json_data = json.dumps(review_info_list, ensure_ascii=False)

        writer.writerow([f"{latitude}, {longitude}", search_history, restaurant_json_data, review_json_data])

    gpt_response = get_recommendations_from_history(csv_file_path)
    favorite_recommend = get_favorite_recommend(csv_file_path)

    def convert_string(input_string):
        new_string = input_string
        new_string = new_string.replace("음식점 이름: ", '"name": "')
        new_string = new_string.replace("음식점 카테고리: ", '"category": "')
        new_string = new_string.replace("음식점 위치: ", '"address": "')
        new_string = new_string.replace("음식점 메뉴: ", '"menu": "')
        new_string = new_string.replace("음식점 리뷰: ", '"review": "')

        new_string = new_string.replace(",\n      ", '",\n      ')
        new_string = new_string.replace('\n   }', '"\n   }')

        return new_string

    converted_string = convert_string(gpt_response['text'])
    favorite_data = convert_recommend(favorite_recommend['text'])

    gpt_data = json.loads(converted_string)
    favorite_data = json.loads(favorite_data)
    combined_data = {
        "gpt_data": gpt_data,
        "favorite_data": favorite_data
    }

    if os.path.exists(csv_file_path):
        os.remove(csv_file_path)

    return Response(combined_data)

# 검색 - 아동
@api_view(['POST'])
def adong_search(request):
    # 요청에서 검색 쿼리 추출
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    query = request.data.get('query')
    radius_m = 500  # 반경 200m로 지정

    # 입력 값 유효성 검사
    if not road_name:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    if not query:
        return Response({"error": "검색 쿼리를 제공해야 합니다."}, status=400)

    # 검색 기록 저장
    AdongSearchHistory.objects.create(query=query)  # 검색 쿼리를 데이터베이스에 저장

    # 주변 음식점 검색
    serialized_restaurants = find_nearby_restaurants(latitude, longitude, radius_m)
    review_search(serialized_restaurants)

    # 예외 처리: 데이터가 없는 경우
    if not serialized_restaurants:
        return Response(None, status=204)  # 204 No Content로 null 반환

    # # CSV 파일 경로 설정
    csv_file_path = './test.csv'

    try:
        # CSV 파일 생성 및 열 제목 추가
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['user_location', 'user_cuisine', 'restaurant_candidates', 'review_data'])

            # 유저 위치 정보와 검색 기록 추가
            restaurant_info_list = []
            for restaurant in serialized_restaurants:
                # restaurant_info 생성
                restaurant_info = {
                    '가맹점명': restaurant['name'],
                    '카테고리': restaurant['category'],
                    '소재지도로명주소': restaurant['address'],
                    '메뉴': restaurant['menu']
                }
                restaurant_info_list.append(restaurant_info)

            review_info_list = []
            for res in serialized_restaurants:
                result = {
                    '가맹점명': res['name'],
                    '리뷰': res['reviews'][:3]
                }
                review_info_list.append(result)
            # 리스트를 JSON 형식으로 변환하여 저장
            restaurant_json_data = json.dumps(restaurant_info_list, ensure_ascii=False)
            review_json_data = json.dumps(review_info_list, ensure_ascii=False)

            writer.writerow([f"{latitude}, {longitude}", query, restaurant_json_data, review_json_data])

        # get_recommendations_from_csv 함수 호출
        gpt_response = get_recommendations_from_csv(csv_file_path)

    finally:
        # 임시 CSV 파일 삭제
        if os.path.exists(csv_file_path):
            os.remove(csv_file_path)

    text_data = gpt_response['text']

    def convert_string(input_string):
        new_string = input_string
        new_string = new_string.replace('"음식점 이름\"', '"name"')
        new_string = new_string.replace('"음식점 카테고리\"', '"category"')
        new_string = new_string.replace('"음식점 위치\"', '"address"')
        new_string = new_string.replace('"음식점 메뉴\"', '"menu"')
        new_string = new_string.replace('"음식점 리뷰\"', '"review"')

        new_string = new_string.replace("\", \"", ',')
        return new_string

    converted_string = convert_string(text_data)

    a = json.loads(converted_string)
    return Response(a)

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

    serialized_stores = find_nearby_stores_by_road_name(road_name)
    # 랜덤으로 5개 뽑아서 전달
    serialized_stores = random.sample(serialized_stores, 5)

    return Response(serialized_stores)


# 검색 - 문화
@api_view(['POST'])
def noori_search(request):
    road_name = request.data.get('road_name')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    query = request.data.get('query')

    # 입력 값 유효성 검사
    if not road_name:
        return Response({"error": "도로명이 필요합니다."}, status=400)

    if latitude is None or longitude is None:
        return Response({"error": "위도와 경도가 필요합니다."}, status=400)

    if not query:
        return Response({"error": "검색 쿼리를 제공해야 합니다."}, status=400)

    # 검색 기록 저장
    NooriSearchHistory.objects.create(query=query)  # 검색 쿼리를 데이터베이스에 저장

    serialized_stores = find_nearby_stores_by_road_name(road_name)

    # 예외 처리: 데이터가 없는 경우
    if not serialized_stores:
        return Response(None, status=204)  # 204 No Content로 null 반환
    # # CSV 파일 경로 설정
    csv_file_path = './test.csv'

    try:
        # CSV 파일 생성 및 열 제목 추가
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['user_location', 'product_query', 'store_candidates'])

            # 유저 위치 정보와 검색 기록 추가
            store_info_list = []
            for store in serialized_stores:
                # restaurant_info 생성
                store_info = {
                    '가맹점명': store['name'],
                    '카테고리': store['category'],
                    '소재지도로명주소': store['address']
                }
                store_info_list.append(store_info)

            # 리스트를 JSON 형식으로 변환하여 저장
            json_data = json.dumps(store_info_list, ensure_ascii=False)
            writer.writerow([f"{latitude}, {longitude}", query, json_data])

        noori_from_csv = get_noori_from_csv(csv_file_path)

    finally:
        # 임시 CSV 파일 삭제
        if os.path.exists(csv_file_path):
            os.remove(csv_file_path)

    text_data = noori_from_csv['text']

    def convert_noori_string(input_string):
        new_string = input_string
        new_string = new_string.replace("가맹점 이름:", '"name": "')
        new_string = new_string.replace("가맹점 카테고리:", '"category": "')
        new_string = new_string.replace("가맹점 위치:", '"address": "')

        new_string = new_string.replace(",\n    ", '",\n    ')
        new_string = new_string.replace(',\n   }', '"\n   }')
        return new_string

    converted_string = convert_noori_string(text_data)
    converted_string = json.loads(converted_string)

    return Response(converted_string)


@api_view(['POST'])
def save_search_result(request):
    if request.method == 'POST':
        food = request.data.get('food')
        if not food:
            return Response({'error': 'Food field is required'}, status=status.HTTP_400_BAD_REQUEST)

        search_result = SearchResult(food=food)
        search_result.save()

        return Response({'message': 'Data saved successfully'}, status=status.HTTP_201_CREATED)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
def restaurant_review(request, restaurant_pk):
    restaurant = Restaurant.objects.get(pk=restaurant_pk)
    if request.method == 'POST':
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(restaurant=restaurant, user=1)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


