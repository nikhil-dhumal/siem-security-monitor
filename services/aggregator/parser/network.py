import re

NETWORK_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+kernel:\s+\[(?P<pid>\d+)\]\s+IN=\S*\s+OUT=\S*\s+SRC=(?P<src_ip>\S+)\s+DST=(?P<dst_ip>\S+)\s+PROTO=(?P<proto>\S+)\s+SPT=(?P<src_port>\d+)\s+DPT=(?P<dst_port>\d+)"
        ),
        {"category": "network", "event_type": "connection"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+named\[\d+\]: client .* query: (?P<domain>\S+) IN A"
        ),
        {"category": "network", "event_type": "dns_query"},
    ),
]
