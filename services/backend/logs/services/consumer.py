from common.redis_stream import consume, ack, create_group
from logs.models import Log
from django.utils.dateparse import parse_datetime

STREAM = "events"
GROUP = "backend_group"
CONSUMER = "backend_1"

def start_consumer():
    create_group(STREAM, GROUP)

    while True:
        messages = consume(STREAM, GROUP, CONSUMER)

        for msg_id, event in messages:

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

                raw_log=event.get("raw_log"),
                raw=event,
            )

            ack(STREAM, GROUP, msg_id)