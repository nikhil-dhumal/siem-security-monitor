import re

VPM_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+openvpn\[(?P<pid>\d+)\]: (?P<user>\S+)/(?P<src_ip>\S+):\d+ VERIFY OK"
        ),
        {"category": "vpn", "event_type": "login", "outcome": "success"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+openvpn\[(?P<pid>\d+)\]: (?P<src_ip>\S+):\d+ TLS Error"
        ),
        {"category": "vpn", "event_type": "login", "outcome": "failure"},
    ),
]
