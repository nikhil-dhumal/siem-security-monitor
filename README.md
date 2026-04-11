# Distributed SIEM System – Security & Anomaly Detector

## Project Overview

This project implements a simplified **Security Information and Event Management (SIEM)** system for the CS682 Software Engineering course at IIT Bombay.

The system is designed to:
- collect logs from multiple simulated sources,
- normalize and process them,
- detect suspicious activity with rule-based logic,
- generate explainable alerts,
- correlate related alerts into incidents,
- provide a web dashboard for monitoring and analysis.

The focus is on a modular, easy-to-understand architecture that demonstrates real SOC workflows in an educational environment.

---

## What this system includes

- **Log generation agents** for workstation, web server, firewall, DNS, file server, and VPN gateway
- **Aggregators** that normalize incoming logs into a unified event format
- **Redis Streams** for event queueing and reliable delivery
- **Django backend + detection worker** for processing events and generating alerts
- **PostgreSQL storage** for logs, alerts, incidents, and rule definitions
- **React dashboard** for real-time alert viewing, analytics, and incident management
- **Prometheus / Grafana monitoring** for system observability
- **Selenium UI smoke test** for basic frontend validation

---

## Current Status

> ⚠️ Work in progress. This repository contains a functional distributed SIEM prototype, but further improvements are planned.

Completed areas include:
- multi-source log ingestion,
- normalized event processing,
- rule-based detection,
- alert and incident modeling,
- frontend dashboard with role-based access controls.

---

## Architecture and Documentation

- Main architecture overview: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Data schema definitions: [docs/SCHEMA.md](docs/SCHEMA.md)

---

## Technology Stack

- Backend: Python, Django, Django REST Framework, Django Channels
- Frontend: React, Vite, WebSockets
- Data store: PostgreSQL
- Event queue: Redis Streams
- Containerization: Docker, Docker Compose
- Monitoring: Prometheus, Grafana
- Testing: Selenium WebDriver

---

## Getting Started

### 1. Start the backend and core services

From the repository root:

```bash
cd infrastructure
docker-compose up --build -d
```

This starts:
- Redis
- PostgreSQL
- Aggregators
- Agents
- Django backend
- Detection worker

### 2. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the dashboard at:
- `http://localhost:5173`

### 3. Start monitoring (Prometheus + Grafana)

From the repository root:

```bash
cd infrastructure
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

Open:
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

The monitoring stack depends on the same `redis` and `postgres` services defined in `docker-compose.yml`.

### 4. Run the Selenium UI smoke test

```bash
cd frontend
npm install
npm run test:selenium
```

> Note: Chrome/Chromium must be installed locally for Selenium tests.

---

## User Roles

The dashboard supports three roles selected via a login dropdown:
- **Viewer**: read-only alert and analytics views
- **Admin**: full access, including rule and incident management
- **Simulator**: simulation controls only

The selected role is stored in the browser and used for client-side access control.

---

## Project Team

- Nikhil Dhumal (25m0766): Agents, aggregator, and event streaming setup
- Ayush Kumar (25m0835): Django backend and frontend integration
- Aditya Manoj (25m0748): Detection engine and project documentation

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.


### Start the System with Docker Compose

```bash
cd infrastructure
docker-compose up --build
```

This will start all services:
- PostgreSQL database
- Redis for event streaming
- Django backend API (port 8002)
- Multiple log aggregators
- Log generator agents
- Detection worker

### Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Monitoring with Prometheus and Grafana

To start the monitoring stack along with the existing infrastructure services:

```bash
cd infrastructure
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

This launches:
- Prometheus on `http://localhost:9090`
- Grafana on `http://localhost:3001`
- Redis exporter on `http://localhost:9121`
- Postgres exporter on `http://localhost:9187`

The monitoring stack uses the Redis and PostgreSQL services defined in `docker-compose.yml`.

Grafana uses the dashboard files in `infrastructure/grafna/dashboard/`.

## Selenium UI Smoke Test

A simple Selenium smoke test is included in the frontend:

```bash
cd frontend
npm install
npm run test:selenium
```

This test launches Chrome in headless mode, opens the frontend at `http://localhost:5173`, and verifies the page loads.

Note: Chrome/Chromium must be installed on your machine for this test to run.

## Login

On the login page, select your user role:

- **Viewer**: Select to test read-only dashboard access
- **Admin**: Select for full access including rules management
- **Simulator**: Select to test attack simulation features

No authentication is required - just select a role and enter the dashboard.

---

# Current Implementation Status

## Completed Features ✅

- **Agent System**: Synthetic log generators for multiple system types (web server, firewall, DNS, etc.)
- **Log Aggregation**: Multiple aggregators normalize logs into common schema
- **Event Storage**: Redis Streams-based event queue
- **Detection Worker**: Rule-based alert generation from events
- **Database**: PostgreSQL for persistent storage of events, alerts, incidents
- **Dashboard**: React-based UI with role-based access
- **Real-time Alerts**: WebSocket streaming of alerts to dashboard
- **Analytics**: Timeline, geography, event type analysis
- **Incident Management**: Correlation of related alerts into incidents
- **Detection Rules**: Admin interface for managing alert rules
- **Simulation**: Controls for triggering simulated attack scenarios
- **User Roles**: Viewer, Admin, Simulator roles with appropriate access levels
- **Performance**: WebSocket message throttling prevents UI freezing

## Architecture & Documentation

- System Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Data Schema: [docs/SCHEMA.md](docs/SCHEMA.md)

---

# Authors

Nikhil Dhumal
Ayush Kumar
Aditya Manoj

MTech CSE
Indian Institute of Technology Bombay

---

# License

This project is licensed under the MIT License. See the LICENSE file for details.