from rest_framework import serializers
from .models import Restaurant, NooriOfflineStore, NooriOnlineStore
import json

class RestaurantSerializer(serializers.ModelSerializer):
    menu = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = '__all__'

    def get_menu(self, obj):
        return json.loads(obj.menu)


class NooriOnlineInfosSerializer(serializers.ModelSerializer):
    class Meta:
        model = NooriOnlineStore
        fields = '__all__'


class NooriOfflineInfosSerializer(serializers.ModelSerializer):
    class Meta:
        model = NooriOfflineStore
        fields = '__all__'