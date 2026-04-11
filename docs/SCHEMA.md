# Schema

This document defines the core data models and API data formats used by the SIEM system.

---

## Normalized Event Schema

Incoming logs are converted into a common event structure before processing.

```json
{
  "id": "string (UUID)",
  "timestamp": "string (ISO 8601 datetime)",
  "source_system": "string (web_server, firewall, dns_server, file_server, vpn_gateway, workstation)",
  "event_type": "string (auth, network, file, process, vpn, system)",
  "event_status": "string (success, failure, suspicious)",
  "source_ip": "string (IP address)",
  "destination_ip": "string (IP address)",
  "source_port": "integer",
  "destination_port": "integer",
  "username": "string",
  "action": "string (login, logout, access, modify, delete, connect, disconnect)",
  "resource": "string (file path, URL, application, database, service)",
  "details": "string",
  "severity": "string (low, medium, high, critical)",
  "raw_message": "string (original log text, optional)"
}
```

### Example Event

```json
{
  "id": "d0f4f2b8-2a8e-4f23-bb3c-8f9c7a5efb63",
  "timestamp": "2026-04-11T14:22:10Z",
  "source_system": "web_server",
  "event_type": "auth",
  "event_status": "failure",
  "source_ip": "192.168.1.10",
  "destination_ip": "10.0.0.5",
  "source_port": 443,
  "destination_port": 8080,
  "username": "user1",
  "action": "login",
  "resource": "/login",
  "details": "Invalid password detected",
  "severity": "medium",
  "raw_message": "Failed login attempt for user1 from 192.168.1.10"
}
```

---

## Alert Schema

Alerts are created when a detection rule matches one or more events.

```json
{
  "id": "integer",
  "timestamp": "string (ISO 8601 datetime)",
  "rule_id": "integer",
  "rule_name": "string",
  "alert_type": "string",
  "severity": "string (low, medium, high, critical)",
  "description": "string",
  "source_ip": "string",
  "username": "string",
  "event_ids": ["string"],
  "status": "string (open, acknowledged, closed)",
  "created_at": "string (ISO 8601 datetime)"
}
```

### Example Alert

```json
{
  "id": 42,
  "timestamp": "2026-04-11T14:22:15Z",
  "rule_id": 3,
  "rule_name": "Multiple failed logins",
  "alert_type": "authentication_failure",
  "severity": "high",
  "description": "Three failed login attempts detected for user1 from 192.168.1.10",
  "source_ip": "192.168.1.10",
  "username": "user1",
  "event_ids": ["d0f4f2b8-2a8e-4f23-bb3c-8f9c7a5efb63"],
  "status": "open",
  "created_at": "2026-04-11T14:22:15Z"
}
```

---

## Incident Schema

Related alerts are grouped into incidents to support investigation.

```json
{
  "id": "integer",
  "title": "string",
  "description": "string",
  "status": "string (open, investigating, resolved, closed)",
  "severity": "string (low, medium, high, critical)",
  "alert_ids": ["integer"],
  "username": "string",
  "source_ips": ["string"],
  "created_at": "string (ISO 8601 datetime)",
  "updated_at": "string (ISO 8601 datetime)",
  "resolved_at": "string (nullable ISO 8601 datetime)"
}
```

---

## Rule Configuration Schema

Detection rules define when alerts should be generated.

```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "rule_type": "string (threshold, pattern, anomaly)",
  "event_type": "string",
  "condition": {
    "field": "string",
    "operator": "string",
    "value": "string | number | boolean"
  },
  "threshold": "integer",
  "time_window": "integer (seconds)",
  "enabled": "boolean",
  "severity": "string (low, medium, high, critical)",
  "created_at": "string (ISO 8601 datetime)"
}
```

### Example Rule Condition

```json
{
  "field": "event_status",
  "operator": "equals",
  "value": "failure"
}
```

---

## Database Tables

The PostgreSQL database includes the following key tables:

| Table | Purpose |
|-------|---------|
| `siem_logevent` | Normalized log events received from aggregators |
| `siem_alert` | Generated alerts from the detection engine |
| `siem_incident` | Correlated incidents created from related alerts |
| `siem_ruleconfig` | Configured detection rules and thresholds |

---
