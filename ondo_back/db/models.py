from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    menu = models.JSONField()
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name


class NooriOnlineStore(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.store_name


class NooriOfflineStore(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.store_name

# 검색 기록 저장
class AdongSearchHistory(models.Model):
    query = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.query

class NooriSearchHistory (models.Model):
    query = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.query