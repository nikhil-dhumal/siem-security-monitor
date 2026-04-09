import re

PROCESS_PATTERNS = [
    (
        re.compile(
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+process:\s+user=(?P<user>\S+)\s+pid=(?P<pid>\d+)\s+cmd="(?P<command>[^"]+)"'
        ),
        {"category": "process", "event_type": "command_execution", "outcome": "success"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+sudo:\s+(?P<user>\S+)\s+:.*COMMAND=(?P<command>.+)"
        ),
        {"category": "process", "event_type": "privilege_escalation", "outcome": "success"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)\s+(?P<host>\S+)\s+systemd\[\d+\]: Started (?P<command>.+)"
        ),
        {"category": "process", "event_type": "start", "outcome": "success"},
    ),
]
