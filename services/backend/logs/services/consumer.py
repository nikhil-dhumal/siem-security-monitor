import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from shared.redis import consume, ack, create_group, EVENT_STREAM
from logs.models import Log
from django.utils.dateparse import parse_datetime

GROUP = "backend_group"
CONSUMER = "backend_1"


def start_consumer():
    print(f"Starting consumer on stream '{EVENT_STREAM}', group '{GROUP}'")
    create_group(EVENT_STREAM, GROUP)

    while True:
        try:
            messages = consume(EVENT_STREAM, GROUP, CONSUMER)
        except Exception as e:
            print(f"Error reading from stream: {e}")
            continue

        for msg_id, event in messages:
            try:
                Log.objects.create(
                    timestamp=parse_datetime(event.get("timestamp")),
                    host=event.get("host"),
                    category=event.get("category"),
                    event_type=event.get("event_type"),
                    outcome=event.get("outcome"),
                    user=event.get("user"),
                    src_ip=event.get("src_ip"),
                    dst_ip=event.get("dst_ip"),
                    src_port=event.get("src_port"),
                    dst_port=event.get("dst_port"),
                    pid=event.get("pid"),
                    command=event.get("command"),
                    file=event.get("file"),
                    proto=event.get("proto"),
                    domain=event.get("domain"),
                    raw_log=event.get("raw_log", ""),
                    raw=event,
                )
                ack(EVENT_STREAM, GROUP, msg_id)
                print(f"Stored log: {event.get('event_type')} from {event.get('host')}")
            except Exception as e:
                print(f"Error storing log: {e}")


if __name__ == "__main__":
    start_consumer()
