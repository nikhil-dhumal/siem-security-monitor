# ============================================================
# FILE: services/backend/logs/routing.py
# WebSocket URL patterns for Django Channels.
# React connects to these WebSocket endpoints:
#
#   ws://localhost:8000/ws/logs/   → live log stream
#   ws://localhost:8000/ws/stats/  → live metric counters
# ============================================================

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # ── Live log stream ──────────────────────────────────────
    # Sends every new Log row to the browser as it's inserted.
    # React LiveAlertFeed and LogTable connect here.
    re_path(r'ws/logs/$', consumers.LogStreamConsumer.as_asgi()),

    # ── Live stats / metrics ─────────────────────────────────
    # Sends updated summary counts every 5 seconds.
    # React MetricCards connects here.
    re_path(r'ws/stats/$', consumers.StatsConsumer.as_asgi()),
]