from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    category = models.CharField(max_length=255)
    menu = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name


class NooriOnlineStore(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class NooriOfflineStore(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# �˻� ��� ����
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
    

class SearchResult(models.Model):
    food = models.CharField(max_length=50)

    def __str__(self):
        return self.food