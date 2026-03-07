from datetime import datetime, UTC
from fastapi import FastAPI
from common import publish, EVENT_STREAM
from .parser import parse_log


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