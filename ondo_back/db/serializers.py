from rest_framework import serializers
from .models import Restaurant, Address
import json

class RestaurantSerializer(serializers.ModelSerializer):
    menu = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = '__all__'

    def get_menu(self, obj):
        return json.loads(obj.menu)

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
