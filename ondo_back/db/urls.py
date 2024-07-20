from django.urls import path
from . import views

app_name = 'db'

urlpatterns = [
    path('save_adong_infos/', views.save_adong_infos, name='save_adong_infos'),
    path('adong_infos/', views.adong_infos, name='adong_infos'),
]
