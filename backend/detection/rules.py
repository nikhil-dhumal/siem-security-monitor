from collections import defaultdict
import time

# in-memory counters
failed_logins = defaultdict(list)
port_scan_tracker = defaultdict(list)


def detect_bruteforce(event):
    if event.get("category") != "auth":
        return None

    if event.get("outcome") != "failure":
        return None

    ip = event.get("src_ip")
    now = time.time()

    failed_logins[ip].append(now)

    # keep only last 60 seconds
    failed_logins[ip] = [t for t in failed_logins[ip] if now - t < 60]

    if len(failed_logins[ip]) >= 5:
        return {
            "type": "bruteforce",
            "category": "auth",
            "severity": "high",
            "timestamp": event.get("timestamp"),
            "src_ip": ip,
            "details": f"{len(failed_logins[ip])} failed logins in 60s",
        }

    return None


def detect_port_scan(event):
    if event.get("category") != "network":
        return None

    ip = event.get("src_ip")
    port = event.get("dst_port")
    now = time.time()

    key = (ip)

    port_scan_tracker[key].append((port, now))

    # last 10 seconds
    recent = [
        p for p, t in port_scan_tracker[key] if now - t < 10
    ]

    unique_ports = len(set(recent))

    if unique_ports >= 10:
        return {
            "type": "port_scan",
            "category": "network",
            "severity": "medium",
            "timestamp": event.get("timestamp"),
            "src_ip": ip,
            "details": f"scanned {unique_ports} ports in 10s",
        }

    return None


def detect_privilege_escalation(event):
    if event.get("event_type") == "privilege_escalation":
        return {
            "type": "privilege_escalation",
            "category": "process",
            "severity": "high",
            "timestamp": event.get("timestamp"),
            "src_ip": event.get("src_ip"),
            "details": f"user {event.get('user')} ran sudo",
        }

    return None


def run_rules(event):
    rules = [
        detect_bruteforce,
        detect_port_scan,
        detect_privilege_escalation,
    ]

    for rule in rules:
        alert = rule(event)
        if alert:
            return alert

    return None
