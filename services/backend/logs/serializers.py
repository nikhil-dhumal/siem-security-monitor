from rest_framework import serializers
from .models import LogEvent

class LogEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEvent
        fields = [
            'id', 'timestamp', 'host', 'category', 'event_type', 'outcome',
            'user', 'src_ip', 'dst_ip', 'src_port', 'dst_port', 'pid',
            'command', 'file_path', 'proto', 'domain', 'raw_log',
            'agent_id', 'agent_type', 'ingested_at', 'latitude', 'longitude'
        ]