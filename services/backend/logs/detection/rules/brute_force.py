from collections import defaultdict, deque
from datetime import datetime, timezone
from .base import BaseRule

_failed_logins: dict[str, deque] = defaultdict(deque)

THRESHOLD = 5
WINDOW_SEC = 60


class BruteForceRule(BaseRule):
    rule_id = "AUTH_001"
    name = "Brute Force Login Attempt"
    severity = "high"

    def evaluate(self, event: dict) -> dict | None:
        if event.get("category") != "auth":
            return None
        if event.get("event_type") != "login":
            return None
        if event.get("outcome") != "failure":
            return None

        src_ip = event.get("src_ip")
        if not src_ip:
            return None

        now = datetime.now(timezone.utc).timestamp()
        timestamps = _failed_logins[src_ip]

        timestamps.append(now)

        while timestamps and now - timestamps[0] > WINDOW_SEC:
            timestamps.popleft()

        if len(timestamps) >= THRESHOLD:
            _failed_logins[src_ip] = deque()
            return self.make_alert(
                event,
                description=f"{len(timestamps)} failed logins from {src_ip} within {WINDOW_SEC}s",
                extra={"src_ip": src_ip, "attempt_count": len(timestamps)},
            )

        return None
