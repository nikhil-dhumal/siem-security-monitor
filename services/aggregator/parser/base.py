from .auth import AUTH_PATTERNS
from .file import FILE_PATTERNS
from .firewall import FIREWALL_PATTERNS
from .network import NETWORK_PATTERNS
from .process import PROCESS_PATTERNS
from .vpn import VPM_PATTERNS
from .web import WEB_PATTERNS

PATTERNS = (
    AUTH_PATTERNS
    + FILE_PATTERNS
    + FIREWALL_PATTERNS
    + NETWORK_PATTERNS
    + PROCESS_PATTERNS
    + VPM_PATTERNS
    + WEB_PATTERNS
)


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
