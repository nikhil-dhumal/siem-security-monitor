import re

VPM_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+openvpn:\s+user=(?P<user>\S+)\s+ip=(?P<src_ip>\S+)\s+connected"
        ),
        {"category": "vpn", "event_type": "login", "outcome": "success"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+openvpn:\s+user=(?P<user>\S+)\s+ip=(?P<src_ip>\S+)\s+authentication_failed"
        ),
        {"category": "vpn", "event_type": "login", "outcome": "failure"},
    ),
]
