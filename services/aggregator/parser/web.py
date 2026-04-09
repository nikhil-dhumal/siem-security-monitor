import re

WEB_PATTERNS = [
    (
        re.compile(
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+(?P<src_ip>\d+\.\d+\.\d+\.\d+)\s+-\s+(?P<user>\S+)\s+\[(?P<http_timestamp>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)\s+HTTP/\S+"\s+(?P<status>\d+)\s+(?P<size>\d+)'
        ),
        {"category": "web", "event_type": "http_request"},
    ),
]
