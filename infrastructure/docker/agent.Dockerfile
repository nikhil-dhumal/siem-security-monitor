FROM python:3.12-slim

WORKDIR /app

COPY services/agent ./agent
COPY configs ./configs

RUN pip install --no-cache-dir pyyaml requests

CMD ["python", "-u", "agent/agent.py"]