from rest_framework import serializers
from .models import RuleConfig

class RuleConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = RuleConfig
        fields = ['id', 'rule_id', 'name', 'description', 'severity', 'enabled', 'threshold', 'window_seconds', 'parameters', 'created_at', 'updated_at']
