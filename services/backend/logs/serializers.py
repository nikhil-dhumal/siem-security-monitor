from rest_framework import serializers
from .models import Log

class LogListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = '__all__'
