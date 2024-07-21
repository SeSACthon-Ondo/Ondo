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
]
