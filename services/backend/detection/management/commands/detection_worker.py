from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.db import transaction
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from shared.redis import consume, ack, create_group, EVENT_STREAM
from logs.models import LogEvent
from alerts.models import Alert, Incident
from detection.models import RuleConfig
from detection.rules import ALL_RULES

GROUP_NAME = 'detection_group'
CONSUMER_NAME = 'worker_1'


def seed_rule_configs():
    for rule in ALL_RULES:
        RuleConfig.objects.get_or_create(
            rule_id=rule.rule_id,
            defaults={
                'name': rule.name,
                'description': getattr(rule, 'description', ''),
                'severity': rule.severity,
                'enabled': True,
                'parameters': {},
            },
        )


def load_active_rule_configs():
    return {conf.rule_id: conf for conf in RuleConfig.objects.filter(enabled=True)}


def build_log_event(event_data: dict) -> LogEvent:
    timestamp = None
    if event_data.get('timestamp'):
        timestamp = parse_datetime(event_data['timestamp'])

    if not timestamp:
        timestamp = parse_datetime(event_data.get('ingested_at') or '') or timezone.now()

    return LogEvent.objects.create(
        timestamp=timestamp,
        host=event_data.get('host'),
        category=event_data.get('category'),
        event_type=event_data.get('event_type'),
        outcome=event_data.get('outcome'),
        user=event_data.get('user'),
        src_ip=event_data.get('src_ip'),
        dst_ip=event_data.get('dst_ip'),
        src_port=event_data.get('src_port'),
        dst_port=event_data.get('dst_port'),
        pid=event_data.get('pid'),
        command=event_data.get('command'),
        file_path=event_data.get('file'),
        proto=event_data.get('proto'),
        domain=event_data.get('domain'),
        raw_log=event_data.get('raw_log'),
        agent_id=event_data.get('agent_id'),
        agent_type=event_data.get('agent_type'),
        ingested_at=event_data.get('ingested_at'),
        latitude=event_data.get('latitude'),
        longitude=event_data.get('longitude'),
    )


def find_existing_incident(alert: Alert):
    if alert.ip_address:
        incident = Incident.objects.filter(
            status__in=['open', 'investigating'],
            alerts__ip_address=alert.ip_address,
        ).order_by('-updated_at').first()
        if incident:
            return incident

    if alert.user:
        return Incident.objects.filter(
            status__in=['open', 'investigating'],
            alerts__user=alert.user,
        ).order_by('-updated_at').first()

    return None


def create_or_update_incident(alert: Alert):
    incident = find_existing_incident(alert)
    if incident:
        incident.alerts.add(alert)
        incident.description = f"{incident.description}\n{alert.description}"
        incident.save(update_fields=['description', 'updated_at'])
        return incident

    title = f"Incident for {alert.ip_address or alert.user or alert.rule}"
    incident = Incident.objects.create(title=title, description=alert.description, status='open')
    incident.alerts.add(alert)
    return incident


def publish_group_message(channel_layer, group_name, message_type, payload):
    async_to_sync(channel_layer.group_send)(
        group_name,
        {'type': message_type, message_type.split('_')[-1]: payload},
    )


class Command(BaseCommand):
    help = 'Run detection worker to process logs from Redis stream'

    def handle(self, *args, **options):
        create_group(EVENT_STREAM, GROUP_NAME)
        channel_layer = get_channel_layer()
        seed_rule_configs()
        active_configs = load_active_rule_configs()

        while True:
            messages = consume(EVENT_STREAM, GROUP_NAME, CONSUMER_NAME, count=1, block=1000)
            if not messages:
                continue

            for msg_id, event_data in messages:
                try:
                    with transaction.atomic():
                        log_event = build_log_event(event_data)
                        publish_group_message(
                            channel_layer,
                            'logs',
                            'send_log',
                            {'id': log_event.id, 'event_type': log_event.event_type, 'raw_log': log_event.raw_log},
                        )

                        for rule in ALL_RULES:
                            config = active_configs.get(rule.rule_id)
                            if config is None:
                                continue
                            alert_payload = rule.evaluate(event_data, config)
                            if not alert_payload:
                                continue

                            alert = Alert.objects.create(
                                rule=alert_payload['rule_name'],
                                severity=alert_payload['severity'],
                                description=alert_payload['description'],
                                log_event=log_event,
                                ip_address=event_data.get('src_ip'),
                                user=event_data.get('user'),
                            )
                            create_or_update_incident(alert)
                            publish_group_message(
                                channel_layer,
                                'alerts',
                                'send_alert',
                                {'id': alert.id, 'rule': alert.rule, 'severity': alert.severity, 'description': alert.description},
                            )

                        ack(EVENT_STREAM, GROUP_NAME, msg_id)
                except Exception as exc:
                    self.stderr.write(f"Error processing event {msg_id}: {exc}")
                    continue
