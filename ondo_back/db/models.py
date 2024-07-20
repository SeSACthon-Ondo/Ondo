from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    menu = models.JSONField()

    def __str__(self):
        return self.name
