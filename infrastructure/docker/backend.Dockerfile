FROM python:3.12-slim

WORKDIR /app

COPY services/backend ./services/backend
COPY shared ./shared

RUN pip install --no-cache-dir django psycopg2-binary redis

ENV DJANGO_SETTINGS_MODULE=config.settings
ENV PYTHONPATH=/app/services/backend:/app

CMD ["sh", "-c", "python services/backend/manage.py migrate && python services/backend/manage.py start_consumer"]