import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from shared.redis import consume, ack, create_group, EVENT_STREAM
from logs.models import Log, Alert
from logs.detection.rules import ALL_RULES
from django.utils.dateparse import parse_datetime
from django.utils import timezone

GROUP = "backend_group"
CONSUMER = "backend_1"


def store_log(event: dict):
    return Log.objects.create(
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


def store_alert(alert: dict):
    known_fields = {"rule_id", "rule_name", "severity", "description", "triggered_at", "event"}
    extra = {k: v for k, v in alert.items() if k not in known_fields}

    return Alert.objects.create(
        rule_id=alert.get("rule_id"),
        rule_name=alert.get("rule_name"),
        severity=alert.get("severity"),
        description=alert.get("description"),
        triggered_at=parse_datetime(alert.get("triggered_at")) or timezone.now(),
        event=alert.get("event", {}),
        extra=extra if extra else None,
    )


def run_rules(event: dict):
    alerts = []
    for rule in ALL_RULES:
        try:
            alert = rule.evaluate(event)
            if alert:
                alerts.append(alert)
        except Exception as e:
            print(f"Error in rule {rule.rule_id}: {e}")
    return alerts


def start_consumer():
    print(f"Starting consumer — {len(ALL_RULES)} detection rules loaded")
    for rule in ALL_RULES:
        print(f"  [{rule.severity.upper()}] {rule.rule_id}: {rule.name}")

    create_group(EVENT_STREAM, GROUP)

    while True:
        try:
            messages = consume(EVENT_STREAM, GROUP, CONSUMER)
        except Exception as e:
            print(f"Error reading from stream: {e}")
            continue

        for msg_id, event in messages:
            try:
                store_log(event)

                alerts = run_rules(event)

                for alert in alerts:
                    alert["event"] = event
                    store_alert(alert)
                    print(
                        f"[ALERT] {alert['rule_id']} | "
                        f"{alert['severity'].upper()} | "
                        f"{alert['description']}"
                    )

                ack(EVENT_STREAM, GROUP, msg_id)

            except Exception as e:
                print(f"Error processing event: {e}")


if __name__ == "__main__":
    start_consumer()