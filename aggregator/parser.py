import re

PATTERNS = [
    (
        re.compile(
            r'(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+process:\s+user=(?P<user>\S+)\s+pid=(?P<pid>\d+)\s+cmd="(?P<command>[^"]+)"'
        ),
        {"category": "process", "event_type": "command_execution"},
    ),
    (
        re.compile(
            r'(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+file_access:\s+user=(?P<user>\S+)\s+file=(?P<file>\S+)\s+action=(?P<action>\w+)'
        ),
        {"category": "file", "event_type": "file_access"},
    ),
    (
        re.compile(
            r'(?P<src_ip>\d+\.\d+\.\d+\.\d+)\s+-\s+(?P<user>\S+)\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<path>\S+)\s+HTTP/\S+"\s+(?P<status>\d+)'
        ),
        {"category": "web", "event_type": "http_request"},
    ),
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
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+iptables:.*SRC=(?P<src_ip>\S+)\s+DST=(?P<dst_ip>\S+).*DPT=(?P<dst_port>\d+).*ACCEPT"
        ),
        {"category": "firewall", "event_type": "allow"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+iptables:.*SRC=(?P<src_ip>\S+)\s+DST=(?P<dst_ip>\S+).*DPT=(?P<dst_port>\d+).*DROP"
        ),
        {"category": "firewall", "event_type": "deny"},
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
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+openvpn\[(?P<pid>\d+)\]: (?P<user>\S+)/(?P<src_ip>\S+):\d+ VERIFY OK"
        ),
        {"category": "vpn", "event_type": "login", "outcome": "success"},
    ),
    (
        re.compile(
            r"(?P<timestamp>\w+\s+\d+\s+\d+:\d+:\d+)\s+(?P<host>\S+)\s+openvpn\[(?P<pid>\d+)\]: (?P<src_ip>\S+):\d+ TLS Error"
        ),
        {"category": "vpn", "event_type": "login", "outcome": "failure"},
    ),
]


def parse_log(line):
    for regex, meta in PATTERNS:
        m = regex.search(line)
        if m:
            data = m.groupdict()
            event = {
                "timestamp": data.get("timestamp"),
                "host": data.get("host"),
                "category": meta.get("category"),
                "event_type": meta.get("event_type"),
            }
            if "outcome" in meta:
                event["outcome"] = meta["outcome"]
            for k in [
                "user",
                "src_ip",
                "dst_ip",
                "src_port",
                "dst_port",
                "pid",
                "command",
                "file",
                "proto",
                "domain",
            ]:
                if data.get(k):
                    event[k] = data[k]
            return event
    return None
