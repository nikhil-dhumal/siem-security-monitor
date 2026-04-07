# ============================================================
# FILE: services/backend/logs/signals.py
# Django post_save signal — fires every time a new Log row
# is inserted into PostgreSQL.
# Immediately pushes the new log to the Redis channel group
# so ALL connected browser tabs receive it in real-time.
# ============================================================

from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Log
from .serializers import LogListSerializer

@receiver(post_save, sender=Log)
def log_saved(sender, instance, created, **kwargs):
    """
    Called automatically by Django every time a Log is saved.
    `created=True` means it's a brand new row (not an update).
    We only push new rows — not updates.
    """
    if not created:
        return  # Skip updates, only push new inserts

    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return  # Channels not configured, skip silently

        # Serialize the Log instance to a plain dict
        log_data = LogListSerializer(instance).data

        # group_send → pushes to ALL consumers in 'logs_stream' group
        # 'type': 'new_log' → calls LogStreamConsumer.new_log() method
        async_to_sync(channel_layer.group_send)(
            'logs_stream',          # group name (same as in consumer)
            {
                'type': 'new_log',  # maps to consumer method name
                'log':  dict(log_data),
            }
        )
    except Exception as e:
        # Never crash the save operation if WebSocket push fails
        print(f'[signals] WebSocket push failed: {e}')
