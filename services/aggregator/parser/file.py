import re

FILE_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+file_access:\s+user=(?P<user>\S+)\s+file=(?P<file>\S+)\s+action=(?P<action>\w+)"
        ),
        {"category": "file", "event_type": "file_access"},
    ),
    (
        re.compile(
            r'(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+audit\[(?P<pid>\d+)\]:.*name="(?P<file>[^"]+)".*CREATE'
        ),
        {"category": "file", "event_type": "create"},
    ),
    (
        re.compile(
            r'(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+audit\[(?P<pid>\d+)\]:.*name="(?P<file>[^"]+)".*DELETE'
        ),
        {"category": "file", "event_type": "delete"},
    ),
    (
        re.compile(
            r'(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+audit\[(?P<pid>\d+)\]:.*name="(?P<file>[^"]+)".*WRITE'
        ),
        {"category": "file", "event_type": "modify"},
    ),
]
