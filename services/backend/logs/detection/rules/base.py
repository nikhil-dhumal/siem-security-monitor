from abc import ABC, abstractmethod
from datetime import datetime, UTC


class BaseRule(ABC):
    rule_id: str
    name: str
    severity: str

    @abstractmethod
    def evaluate(self, event: dict):
        pass

    def make_alert(self, event: dict, description: str, extra: dict = None):
        alert = {
            "rule_id": self.rule_id,
            "rule_name": self.name,
            "severity": self.severity,
            "description": description,
            "triggered_at": datetime.now(UTC).isoformat(),
            "event": event,
        }
        if extra:
            alert.update(extra)
        return alert
