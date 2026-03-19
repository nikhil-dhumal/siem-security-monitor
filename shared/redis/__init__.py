from .redis_stream import publish, consume, ack, create_group

EVENT_STREAM = "event_stream"
ALERT_STREAM = "alert_stream"

EVENT_GROUP = "detection_workers"
ALERT_GROUP = "django_consumers"

__all__ = ["publish", "consume", "ack", "create_group", "EVENT_STREAM", "ALERT_STREAM", "EVENT_GROUP", "ALERT_GROUP"]
