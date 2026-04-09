from rest_framework import serializers
from .models import Alert, Incident

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ['id', 'timestamp', 'rule', 'severity', 'description', 'ip_address', 'user', 'acknowledged']

class IncidentSerializer(serializers.ModelSerializer):
    total_alerts = serializers.SerializerMethodField()
    high_severity_alerts = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = ['id', 'title', 'description', 'status', 'created_at', 'updated_at', 'alerts', 'total_alerts', 'high_severity_alerts']

    def get_total_alerts(self, obj):
        return obj.alerts.count()

    def get_high_severity_alerts(self, obj):
        return obj.alerts.filter(severity__in=['high', 'critical']).count()