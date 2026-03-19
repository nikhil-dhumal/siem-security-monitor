FROM python:3.12-slim

WORKDIR /app

COPY services/aggregator ./aggregator
COPY shared ./shared

RUN pip install --no-cache-dir fastapi uvicorn redis pyyaml requests

CMD ["uvicorn", "aggregator.aggregator:app", "--host", "0.0.0.0", "--port", "8000"]