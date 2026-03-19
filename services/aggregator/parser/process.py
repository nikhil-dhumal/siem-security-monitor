import re

PROCESS_PATTERNS = [
    (
        re.compile(
            r'(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+process:\s+user=(?P<user>\S+)\s+pid=(?P<pid>\d+)\s+cmd="(?P<command>[^"]+)"'
        ),
        {"category": "process", "event_type": "command_execution"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+sudo:\s+(?P<user>\S+)\s+:.*COMMAND=(?P<command>.+)"
        ),
        {"category": "process", "event_type": "privilege_escalation"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+systemd\[\d+\]: Started (?P<command>.+)"
        ),
        {"category": "process", "event_type": "start"},
    ),
]
