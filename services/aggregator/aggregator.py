import sys
import os

# Add parent directories to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone
from fastapi import FastAPI
from shared.redis import publish, EVENT_STREAM
from parser.base import parse_log

UTC = timezone.utc

app = FastAPI()


@app.post("/ingest")
async def ingest_log(payload: dict):
    log = payload.get("log")

    event = parse_log(log)

    if not event:
        return {"status": "ignored"}

    event["raw_log"] = log
    event["ingested_at"] = datetime.now(UTC).isoformat()
    print(log, event)

    try:
        publish(EVENT_STREAM, event)
    except Exception as e:
        print(f"Failed to publish event to event stream: {e}")
        return {"status": "error"}

    return {"status": "ok"}
