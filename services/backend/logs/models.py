from django.db import models

class LogEvent(models.Model):
    timestamp = models.DateTimeField(null=True, blank=True)
    host = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    event_type = models.CharField(max_length=100, null=True, blank=True)
    outcome = models.CharField(max_length=50, null=True, blank=True)
    user = models.CharField(max_length=255, null=True, blank=True)
    src_ip = models.GenericIPAddressField(null=True, blank=True)
    dst_ip = models.GenericIPAddressField(null=True, blank=True)
    src_port = models.IntegerField(null=True, blank=True)
    dst_port = models.IntegerField(null=True, blank=True)
    pid = models.IntegerField(null=True, blank=True)
    command = models.TextField(null=True, blank=True)
    file_path = models.TextField(null=True, blank=True)
    proto = models.CharField(max_length=10, null=True, blank=True)
    domain = models.CharField(max_length=255, null=True, blank=True)
    raw_log = models.TextField(null=True, blank=True)
    agent_id = models.CharField(max_length=255, null=True, blank=True)
    agent_type = models.CharField(max_length=100, null=True, blank=True)
    ingested_at = models.DateTimeField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} - {self.event_type}: {self.raw_log[:50]}"
