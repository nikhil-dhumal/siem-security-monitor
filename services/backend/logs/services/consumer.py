import django
import os
import sys

# Add parent directories to path for proper module discovery
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
                # Parse timestamp - use ingested_at if provided, otherwise parse timestamp
                timestamp = None
                ts_str = event.get("timestamp")
                ingested_str = event.get("ingested_at")
                
                if ingested_str:
                    # Use ingested_at which is properly ISO formatted
                    timestamp = parse_datetime(ingested_str)
                elif ts_str:
                    # Try ISO format first
                    timestamp = parse_datetime(ts_str)
                    if not timestamp:
                        # Try common syslog format: "Mar 20 03:10:12"
                        from datetime import datetime
                        try:
                            # Add current year if not present
                            from django.utils import timezone
                            now = timezone.now()
                            ts_with_year = f"{ts_str} {now.year}"
                            timestamp = datetime.strptime(ts_with_year, "%b %d %H:%M:%S %Y")
                            # Make it timezone aware
                            timestamp = timezone.make_aware(timestamp)
                        except:
                            try:
                                # Try ISO format with Z
                                timestamp = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
                            except:
                                timestamp = None
                
                # Convert string port numbers to int if they're numeric strings
                src_port = event.get("src_port")
                dst_port = event.get("dst_port")
                pid = event.get("pid")
                
                if src_port and isinstance(src_port, str) and src_port.isdigit():
                    src_port = int(src_port)
                elif not src_port or (isinstance(src_port, str) and not src_port.isdigit()):
                    src_port = None
                    
                if dst_port and isinstance(dst_port, str) and dst_port.isdigit():
                    dst_port = int(dst_port)
                elif not dst_port or (isinstance(dst_port, str) and not dst_port.isdigit()):
                    dst_port = None
                    
                if pid and isinstance(pid, str) and pid.isdigit():
                    pid = int(pid)
                elif not pid or (isinstance(pid, str) and not pid.isdigit()):
                    pid = None
                
                log = Log.objects.create(
                    timestamp=timestamp,
                    host=event.get("host"),
                    category=event.get("category"),
                    event_type=event.get("event_type"),
                    outcome=event.get("outcome"),
                    user=event.get("user"),
                    src_ip=event.get("src_ip"),
                    dst_ip=event.get("dst_ip"),
                    src_port=src_port,
                    dst_port=dst_port,
                    pid=pid,
                    command=event.get("command"),
                    file=event.get("file"),
                    proto=event.get("proto"),
                    domain=event.get("domain"),
                    raw_log=event.get("raw_log", ""),
                    raw=event,
                )
                ack(EVENT_STREAM, GROUP, msg_id)
                print(f"✓ Stored log #{log.id}: {event.get('event_type')} @ {timestamp}")
            except Exception as e:
                print(f"✗ Error storing log: {e}")
                import traceback
                traceback.print_exc()
                # Still ack the message so we don't get stuck
                try:
                    ack(EVENT_STREAM, GROUP, msg_id)
                except:
                    pass


if __name__ == "__main__":
    start_consumer()
