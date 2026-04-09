FROM python:3.12-slim

WORKDIR /app

COPY services/backend ./services/backend
COPY services/backend/requirements.txt ./services/backend/requirements.txt
COPY shared ./shared
COPY scripts/start_backend.sh /app/start_backend.sh
RUN pip install --no-cache-dir -r ./services/backend/requirements.txt
RUN chmod +x /app/start_backend.sh

ENV PYTHONPATH=/app:/app/services/backend
ENV DJANGO_SETTINGS_MODULE=config.settings

CMD ["/app/start_backend.sh"]