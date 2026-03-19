import re

FIREWALL_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+iptables:.*SRC=(?P<src_ip>\S+)\s+DST=(?P<dst_ip>\S+).*DPT=(?P<dst_port>\d+).*ACCEPT"
        ),
        {"category": "firewall", "event_type": "allow"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+iptables:.*SRC=(?P<src_ip>\S+)\s+DST=(?P<dst_ip>\S+).*DPT=(?P<dst_port>\d+).*DROP"
        ),
        {"category": "firewall", "event_type": "deny"},
    ),
]
