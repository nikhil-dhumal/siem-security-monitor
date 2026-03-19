import re

WEB_PATTERNS = [
    (
        re.compile(
            r'(?P<src_ip>\d+\.\d+\.\d+\.\d+)\s+-\s+(?P<user>\S+)\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)\s+HTTP/\S+"\s+(?P<status>\d+)'
        ),
        {"category": "web", "event_type": "http_request"},
    ),
]
