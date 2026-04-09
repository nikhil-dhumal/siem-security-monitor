import re

FILE_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+file_access:\s+user=(?P<user>\S+)\s+file=(?P<file>\S+)\s+action=(?P<action>\w+)"
        ),
        {"category": "file", "event_type": "file_access", "outcome": "success"},
    ),
    (
        re.compile(
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+audit\[(?P<pid>\d+)\]:.*name="(?P<file>[^"]+)".*CREATE'
        ),
        {"category": "file", "event_type": "create", "outcome": "success"},
    ),
    (
        re.compile(
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+audit\[(?P<pid>\d+)\]:.*name="(?P<file>[^"]+)".*DELETE'
        ),
        {"category": "file", "event_type": "delete", "outcome": "success"},
    ),
    (
        re.compile(
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+audit\[(?P<pid>\d+)\]:.*name="(?P<file>[^"]+)".*WRITE'
        ),
        {"category": "file", "event_type": "modify", "outcome": "success"},
    ),
]
