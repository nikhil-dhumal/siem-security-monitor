import re

NETWORK_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+named\[(?P<pid>\d+)\]:\s+client\s+(?P<src_ip>\S+)#(?P<src_port>\d+):\s+query:\s+(?P<domain>\S+)\s+IN\s+A"
        ),
        {"category": "network", "event_type": "dns_query", "outcome": "success"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+named\[(?P<pid>\d+)\]:\s+client\s+(?P<src_ip>\S+)#(?P<src_port>\d+):\s+query:\s+(?P<domain>\S+)\s+IN\s+A\s+NXDOMAIN"
        ),
        {"category": "network", "event_type": "dns_failure", "outcome": "failure"},
    ),
]
