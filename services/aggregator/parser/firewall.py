import re

FIREWALL_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+kernel:\s+IN=(?P<in_if>\S+)\s+OUT=(?P<out_if>\S+)\s+SRC=(?P<src_ip>\S+)\s+DST=(?P<dst_ip>\S+)\s+PROTO=(?P<proto>\S+)\s+SPT=(?P<src_port>\d+)\s+DPT=(?P<dst_port>\d+)\s+ACTION=ALLOW"
        ),
        {"category": "firewall", "event_type": "allow", "outcome": "allowed"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+kernel:\s+IN=(?P<in_if>\S+)\s+OUT=(?P<out_if>\S+)\s+SRC=(?P<src_ip>\S+)\s+DST=(?P<dst_ip>\S+)\s+PROTO=(?P<proto>\S+)\s+SPT=(?P<src_port>\d+)\s+DPT=(?P<dst_port>\d+)\s+ACTION=BLOCK"
        ),
        {"category": "firewall", "event_type": "deny", "outcome": "blocked"},
    ),
]
