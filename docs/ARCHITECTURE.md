# System Architecture

## Overview

This project implements a distributed **Security Information and Event Management (SIEM)** system.

It is designed to collect logs from multiple synthetic sources, normalize them, process events with a rule-based detection engine, and present alerts through a web dashboard.

The architecture is modular and event-driven, with separate ingestion, processing, storage, and presentation layers.

---

## Key Components

### 1. Log Generation Agents
- Simulate activity for different systems: workstation, web server, firewall, DNS server, file server, and VPN gateway.
- Generate synthetic logs and send them to aggregator endpoints.
- Support attack scenarios such as failed logins, suspicious access, and unusual network activity.

### 2. Aggregators
- Receive raw logs from agents via HTTP POST.
- Parse source-specific log formats.
- Normalize logs into a shared event schema.
- Publish normalized events into Redis Streams.

### 3. Redis Streams
- Acts as the central event queue.
- Stores normalized events reliably until consumed.
- Supports consumer groups and replay for fault tolerance.

### 4. Detection Worker
- Runs as part of the Django environment.
- Consumes normalized events from Redis Streams.
- Applies rule-based detection logic.
- Creates alerts and incidents in PostgreSQL.
- Broadcasts real-time alerts to connected frontend clients via WebSocket.

### 5. PostgreSQL
- Persists normalized events, alerts, incidents, and rule configurations.
- Enables historical queries and analytics.

### 6. React Dashboard
- Displays live alerts, incident summaries, analytics, and history.
- Subscribes to real-time alert updates via WebSocket.
- Uses REST APIs for paginated data and analytics queries.
- Implements role-based UI controls for Viewer, Admin, and Simulator users.

### 7. Monitoring Layer
- Prometheus scrapes metrics from Redis and PostgreSQL exporters.
- Grafana visualizes system health and performance dashboards.

---

## Data Flow

### Real-time alert processing
1. An agent generates a synthetic log event.
2. The agent sends the log to an aggregator endpoint.
3. The aggregator normalizes the log into the shared event schema.
4. The aggregator publishes the event to Redis Streams.
5. The detection worker consumes the event.
6. The worker evaluates the event against detection rules.
7. If a rule matches, an alert is generated and saved.
8. The alert is broadcast via WebSocket to the frontend.
9. Connected dashboard clients receive the alert instantly.

### Historical query flow
1. The frontend sends a REST request to the backend.
2. The backend queries PostgreSQL for stored alerts or incidents.
3. The response is returned to the frontend.
4. The dashboard renders historical data and analytics.

---

## Design Principles

**Modularity:** Each component has a single clear responsibility

**Scalability:** 
- Horizontal scaling of agents and aggregators
- Multiple workers can process events independently
- Redis Streams enables consumer groups

**Real-time:** Detection and alerting happen in milliseconds

**Reliability:** 
- Redis Streams persists events
- Database persistence for historical analysis
- No data loss on component restart

**Separation of Concerns:**
- Log collection (agents/aggregators)
- Event processing (detection worker)
- Data storage (PostgreSQL)
- Real-time delivery (Channels)
- UI/visualization (React)


