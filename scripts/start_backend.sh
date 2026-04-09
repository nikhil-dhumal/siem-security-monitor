#!/bin/bash
set -e

cd /app/services/backend
export PYTHONPATH=/app:/app/services/backend:$PYTHONPATH
export DJANGO_SETTINGS_MODULE=config.settings

echo "Running migrations..."
python manage.py migrate

echo "Starting detection worker in background..."
python manage.py detection_worker &

echo "Starting Daphne ASGI server..."
daphne -b 0.0.0.0 -p 8000 config.asgi:application