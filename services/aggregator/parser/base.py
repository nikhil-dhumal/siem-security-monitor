from .auth import AUTH_PATTERNS
from .file import FILE_PATTERNS
from .firewall import FIREWALL_PATTERNS
from .network import NETWORK_PATTERNS
from .process import PROCESS_PATTERNS
from .vpn import VPM_PATTERNS
from .web import WEB_PATTERNS
from datetime import datetime, timezone
import calendar


PATTERNS = (
    AUTH_PATTERNS
    + FILE_PATTERNS
    + FIREWALL_PATTERNS
    + NETWORK_PATTERNS
    + PROCESS_PATTERNS
    + VPM_PATTERNS
    + WEB_PATTERNS
)


def normalize_timestamp(ts):
    """Parse ISO 8601 timestamp (e.g., '2026-04-09T13:43:09.123456+00:00')"""
    try:
        # Try parsing ISO format first
        dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        return dt.isoformat()
    except:
        # Fallback: try old syslog format for backward compatibility
        try:
            dt = datetime.strptime(ts, "%b %d %H:%M:%S")
            current_year = datetime.now().year
            dt = dt.replace(year=current_year, tzinfo=timezone.utc)
            return dt.isoformat()
        except:
            return None


def parse_log(line):
    for regex, meta in PATTERNS:
        m = regex.search(line)
        if m:
            data = m.groupdict()
            event = {
                "timestamp": normalize_timestamp(data.get("timestamp")),
                "host": data.get("host"),
                "category": meta.get("category"),
                "event_type": meta.get("event_type"),
            }
            if "outcome" in meta:
                event["outcome"] = meta["outcome"]
            elif data.get("status") is not None:
                try:
                    status_code = int(data.get("status"))
                    event["outcome"] = "success" if status_code < 400 else "failure"
                except ValueError:
                    event["outcome"] = "unknown"
            else:
                event["outcome"] = "unknown"

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
                "status",
                "size",
            ]:
                if data.get(k):
                    event[k] = data[k]
            return event
    return None
