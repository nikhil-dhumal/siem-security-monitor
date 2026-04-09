from django.contrib import admin
from .models import RuleConfig

@admin.register(RuleConfig)
class RuleConfigAdmin(admin.ModelAdmin):
    list_display = ('rule_id', 'name', 'severity', 'enabled', 'threshold', 'window_seconds')
    list_filter = ('severity', 'enabled')
    search_fields = ('rule_id', 'name', 'description')
