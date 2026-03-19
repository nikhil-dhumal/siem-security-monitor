from common.redis_stream import consume, ack, create_group, publish
from config import EVENT_STREAM, ALERT_STREAM, WORKER_GROUP, WORKER_NAME


def init_group():
    create_group(EVENT_STREAM, WORKER_GROUP)


def read_events():
    return consume(
        EVENT_STREAM,
        WORKER_GROUP,
        WORKER_NAME,
    )


def acknowledge(message_id):
    ack(EVENT_STREAM, WORKER_GROUP, message_id)


def publish_alert(alert):
    publish(ALERT_STREAM, alert)
