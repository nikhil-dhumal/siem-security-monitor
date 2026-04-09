import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone
from fastapi import FastAPI
from shared.redis import publish, EVENT_STREAM
from parser.base import parse_log

UTC = timezone.utc

app = FastAPI()


@app.post("/ingest")
async def ingest_log(payload: dict):
    agent_id = payload.get("agent_id")
    agent_type = payload.get("agent_type")
    log = payload.get("log")
    latitude = payload.get("latitude")
    longitude = payload.get("longitude")

    parsed = parse_log(log)

    if not parsed:
        parsed = {
            "timestamp": payload.get("ingested_at") or datetime.now(UTC).isoformat(),
            "host": payload.get("host"),
            "category": payload.get("category"),
            "event_type": payload.get("event_type"),
            "outcome": payload.get("outcome") or "unknown",
            "src_ip": payload.get("src_ip"),
            "dst_ip": payload.get("dst_ip"),
            "src_port": payload.get("src_port"),
            "dst_port": payload.get("dst_port"),
            "pid": payload.get("pid"),
            "command": payload.get("command"),
            "file": payload.get("file"),
            "proto": payload.get("proto"),
            "domain": payload.get("domain"),
        }

    event = {
        **parsed,
        "raw_log": log,
        "agent_id": agent_id,
        "agent_type": agent_type,
        "ingested_at": datetime.now(UTC).isoformat(),
        "latitude": latitude,
        "longitude": longitude,
    }

    try:
        publish(EVENT_STREAM, event)
    except Exception as e:
        print(f"Redis publish error: {e}")
        return {"status": "error"}

    return {"status": "ok"}
