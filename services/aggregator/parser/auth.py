import re

AUTH_PATTERNS = [
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+sshd\[(?P<pid>\d+)\]: Accepted password for (?P<user>\S+) from (?P<src_ip>\S+) port (?P<src_port>\d+)"
        ),
        {"category": "auth", "event_type": "login", "outcome": "success"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+sshd\[(?P<pid>\d+)\]: Failed password for (?P<user>\S+) from (?P<src_ip>\S+) port (?P<src_port>\d+)"
        ),
        {"category": "auth", "event_type": "login", "outcome": "failure"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+sshd\[(?P<pid>\d+)\]: Invalid user (?P<user>\S+) from (?P<src_ip>\S+) port (?P<src_port>\d+)"
        ),
        {"category": "auth", "event_type": "invalid_user"},
    ),
]
