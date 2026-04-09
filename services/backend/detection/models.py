from django.db import models

class RuleConfig(models.Model):
    rule_id = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    severity = models.CharField(max_length=32, default='medium')
    enabled = models.BooleanField(default=True)
    threshold = models.IntegerField(null=True, blank=True)
    window_seconds = models.IntegerField(null=True, blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['rule_id']

    def __str__(self):
        return f"{self.rule_id} - {self.name}"
