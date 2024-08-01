from django.urls import path
from . import views

app_name = 'db'

urlpatterns = [
    path('save_adong_infos/', views.save_adong_infos, name='save_adong_infos'),
    path('save_noori_online_infos/', views.save_noori_online_infos, name='save_noori_online_infos'),
    path('save_noori_offline_infos/', views.save_noori_offline_infos, name='save_noori_offline_infos'),
    path('adong_infos/', views.adong_infos, name='adong_infos'),
    path('noori_online_infos/', views.noori_online_infos, name='noori_online_infos'),
    path('noori_offline_infos/', views.noori_offline_infos, name='noori_offline_infos'),
    path('adong/send_address/', views.adong_send_address, name='adong_send_address'),
    path('adong/search/', views.adong_search, name='adong_search'),
    path('noori/send_address/', views.noori_send_address, name='noori_send_address'),
    path('noori/search/', views.noori_search, name='noori_search'),
    path('save_search_result/', views.save_search_result, name='save_search_result'),
    path('review/', views.restaurant_review, name='review'),
]
