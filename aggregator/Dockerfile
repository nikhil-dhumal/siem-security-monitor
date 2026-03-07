FROM python:3.12-slim

WORKDIR /app

COPY aggregator ./aggregator
COPY common ./common
COPY configs ./configs

RUN pip install --no-cache-dir fastapi uvicorn redis pyyaml requests

CMD ["uvicorn", "aggregator.aggregator:app", "--host", "0.0.0.0", "--port", "8000"]