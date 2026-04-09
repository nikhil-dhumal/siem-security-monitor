from abc import ABC, abstractmethod
from collections import defaultdict, deque
from datetime import datetime, timezone


class BaseRule(ABC):
    rule_id: str
    name: str
    severity: str
    description: str = ""

    @abstractmethod
    def evaluate(self, event: dict, config=None):
        pass

    def make_alert(self, event: dict, description: str, extra: dict = None):
        alert = {
            "rule_id": self.rule_id,
            "rule_name": self.name,
            "severity": self.severity,
            "description": description,
            "triggered_at": datetime.now(timezone.utc).isoformat(),
            "event": event,
        }
        if extra:
            alert.update(extra)
        return alert


class BruteForceRule(BaseRule):
    rule_id = "AUTH_001"
    name = "Brute Force Login Attempt"
    severity = "high"
    description = "Detect multiple failed login attempts from the same source IP."

    _failed_logins: dict[str, deque] = defaultdict(deque)
    default_threshold = 5
    default_window = 60

    def evaluate(self, event: dict, config=None):
        if event.get("category") != "auth":
            return None
        if event.get("event_type") != "login":
            return None
        if event.get("outcome") != "failure":
            return None

        src_ip = event.get("src_ip")
        if not src_ip:
            return None

        threshold = config.parameters.get("threshold") if config and config.parameters.get("threshold") else self.default_threshold
        window = config.parameters.get("window_seconds") if config and config.parameters.get("window_seconds") else self.default_window

        now = datetime.now(timezone.utc).timestamp()
        timestamps = self._failed_logins[src_ip]
        timestamps.append(now)

        while timestamps and now - timestamps[0] > window:
            timestamps.popleft()

        if len(timestamps) >= threshold:
            self._failed_logins[src_ip] = deque()
            return self.make_alert(
                event,
                description=f"{len(timestamps)} failed logins from {src_ip} within {window}s",
                extra={"src_ip": src_ip, "attempt_count": len(timestamps)},
            )
        return None


class FirewallDenyRule(BaseRule):
    rule_id = "FW_001"
    name = "Repeated Firewall Denies"
    severity = "medium"
    description = "Detect repeated firewall deny events from the same source IP."

    _denies: dict[str, deque] = defaultdict(deque)
    default_threshold = 10
    default_window = 60

    def evaluate(self, event: dict, config=None):
        if event.get("category") != "firewall":
            return None
        if event.get("event_type") not in ["deny", "blocked"]:
            return None

        src_ip = event.get("src_ip")
        if not src_ip:
            return None

        params = (config.parameters or {}) if config else {}
        threshold = params.get("threshold", self.default_threshold)
        window = params.get("window_seconds", self.default_window)

        now = datetime.now(timezone.utc).timestamp()
        timestamps = self._denies[src_ip]
        timestamps.append(now)

        while timestamps and now - timestamps[0] > window:
            timestamps.popleft()

        if len(timestamps) >= threshold:
            self._denies[src_ip] = deque()
            return self.make_alert(
                event,
                description=f"{len(timestamps)} firewall denies from {src_ip} within {window}s",
                extra={"src_ip": src_ip, "deny_count": len(timestamps)},
            )
        return None


class PortScanRule(BaseRule):
    rule_id = "NET_002"
    name = "Port Scan Detected"
    severity = "medium"
    description = "Detect network connection attempts to many distinct ports from the same source IP."

    _connections: dict[str, deque] = defaultdict(deque)
    default_threshold = 10
    default_window = 30

    def evaluate(self, event: dict, config=None):
        if event.get("category") != "network":
            return None
        if event.get("event_type") != "connection":
            return None

        src_ip = event.get("src_ip")
        dst_port = event.get("dst_port")
        if not src_ip or not dst_port:
            return None

        params = (config.parameters or {}) if config else {}
        threshold = params.get("threshold", self.default_threshold)
        window = params.get("window_seconds", self.default_window)

        now = datetime.now(timezone.utc).timestamp()
        history = self._connections[src_ip]
        history.append((now, dst_port))

        while history and now - history[0][0] > window:
            history.popleft()

        distinct_ports = {entry[1] for entry in history}
        if len(distinct_ports) >= threshold:
            self._connections[src_ip] = deque()
            return self.make_alert(
                event,
                description=f"Port scan from {src_ip}: {len(distinct_ports)} distinct ports within {window}s",
                extra={"src_ip": src_ip, "port_count": len(distinct_ports), "ports": list(distinct_ports)},
            )
        return None


class RootCommandRule(BaseRule):
    rule_id = "PROC_001"
    name = "Suspicious Root Command Execution"
    severity = "high"
    description = "Detect dangerous command execution when run as root."

    HIGH_RISK_COMMANDS = {
        "cat /etc/passwd",
        "cat /etc/shadow",
        "cat /etc/sudoers",
        "whoami",
        "id",
        "passwd",
        "adduser",
        "useradd",
        "userdel",
        "chmod 777",
        "chown root",
        "visudo",
        "sudo su",
        "su -",
        "nc ",
        "ncat ",
        "netcat ",
        "curl ",
        "wget ",
    }

    def evaluate(self, event: dict, config=None):
        if event.get("category") != "process":
            return None
        if event.get("event_type") != "command_execution":
            return None
        if event.get("user") != "root":
            return None

        command = (event.get("command") or "").lower()
        if any(command.startswith(c) or command == c for c in self.HIGH_RISK_COMMANDS):
            return self.make_alert(
                event,
                description=f"Suspicious command run as root: '{event.get('command')}' on {event.get('host')}",
                extra={"command": event.get("command"), "host": event.get("host")},
            )
        return None


class SuspiciousDNSRule(BaseRule):
    rule_id = "NET_001"
    name = "Suspicious DNS Query"
    severity = "medium"
    description = "Detect DNS queries to known malicious domains or suspicious TLDs."

    SUSPICIOUS_DOMAINS = {
        "malicious.com",
        "evil.com",
        "badactor.net",
        "c2server.io",
        "exfil.xyz",
        "phishing.site",
    }

    SUSPICIOUS_TLDS = {".xyz", ".top", ".click", ".pw", ".cc"}

    def evaluate(self, event: dict, config=None):
        if event.get("category") != "network":
            return None
        if event.get("event_type") != "dns_query":
            return None

        domain = (event.get("domain") or "").lower()
        if not domain:
            return None

        if domain in self.SUSPICIOUS_DOMAINS:
            return self.make_alert(
                event,
                description=f"DNS query to known malicious domain: {domain}",
                extra={"domain": domain, "host": event.get("host")},
            )

        for tld in self.SUSPICIOUS_TLDS:
            if domain.endswith(tld):
                return self.make_alert(
                    event,
                    description=f"DNS query to suspicious TLD domain: {domain}",
                    extra={"domain": domain, "host": event.get("host")},
                )
        return None


ALL_RULES = [
    BruteForceRule(),
    RootCommandRule(),
    SuspiciousDNSRule(),
    PortScanRule(),
    FirewallDenyRule(),
]
