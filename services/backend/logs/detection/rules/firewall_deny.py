from collections import defaultdict, deque
from datetime import datetime, UTC
from .base import BaseRule

_denies: dict[str, deque] = defaultdict(deque)

THRESHOLD = 10
WINDOW_SEC = 60


class FirewallDenyRule(BaseRule):
    rule_id = "FW_001"
    name = "Repeated Firewall Denies"
    severity = "medium"

    def evaluate(self, event: dict) -> dict | None:
        if event.get("category") != "firewall":
            return None
        if event.get("event_type") != "deny":
            return None

        src_ip = event.get("src_ip")
        if not src_ip:
            return None

        now = datetime.now(UTC).timestamp()
        timestamps = _denies[src_ip]

        timestamps.append(now)

        while timestamps and now - timestamps[0] > WINDOW_SEC:
            timestamps.popleft()

        if len(timestamps) >= THRESHOLD:
            _denies[src_ip] = deque()
            return self.make_alert(
                event,
                description=f"{len(timestamps)} firewall denies from {src_ip} within {WINDOW_SEC}s",
                extra={"src_ip": src_ip, "deny_count": len(timestamps)},
            )

        return None