import os

# Redis 
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Streams
EVENT_STREAM = os.getenv("EVENT_STREAM", "events")
ALERT_STREAM = os.getenv("ALERT_STREAM", "alerts")

# Worker config
WORKER_GROUP = "detection_workers"
WORKER_NAME = os.getenv("WORKER_NAME", "worker_1")

# PostgreSQL
POSTGRES_CONFIG = {
    "dbname": os.getenv("POSTGRES_DB", "siem"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", "password"),
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": int(os.getenv("POSTGRES_PORT", 5432)),
}
