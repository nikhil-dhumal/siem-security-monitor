from collections import defaultdict, deque
from datetime import datetime, UTC
from .base import BaseRule

_connections: dict[str, deque] = defaultdict(deque)

THRESHOLD = 10
WINDOW_SEC = 30


class PortScanRule(BaseRule):
    rule_id = "NET_002"
    name = "Port Scan Detected"
    severity = "medium"

    def evaluate(self, event: dict) -> dict | None:
        if event.get("category") != "network":
            return None
        if event.get("event_type") != "connection":
            return None

        src_ip = event.get("src_ip")
        dst_port = event.get("dst_port")
        if not src_ip or not dst_port:
            return None

        now = datetime.now(UTC).timestamp()
        history = _connections[src_ip]

        history.append((now, dst_port))

        while history and now - history[0][0] > WINDOW_SEC:
            history.popleft()

        distinct_ports = {entry[1] for entry in history}

        if len(distinct_ports) >= THRESHOLD:
            _connections[src_ip] = deque()
            return self.make_alert(
                event,
                description=f"Port scan from {src_ip}: {len(distinct_ports)} distinct ports within {WINDOW_SEC}s",
                extra={"src_ip": src_ip, "port_count": len(distinct_ports), "ports": list(distinct_ports)},
            )

        return None