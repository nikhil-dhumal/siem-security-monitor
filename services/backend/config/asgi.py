# ============================================================
# FILE: services/backend/config/asgi.py
# Replaces the default wsgi.py for Django Channels.
# Handles both normal HTTP requests AND WebSocket connections.
# Run with:  daphne config.asgi:application  (instead of gunicorn)
# Or dev:    python manage.py runserver  (Channels auto-uses ASGI)
# ============================================================

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Must call setup before importing routing (which imports models)
django.setup()

import logs.routing  # noqa: E402 — import after setup

application = ProtocolTypeRouter({
    # ── HTTP requests → normal Django views / REST API ───────
    'http': get_asgi_application(),

    # ── WebSocket connections → Django Channels consumers ────
    # AllowedHostsOriginValidator  → checks Origin header matches ALLOWED_HOSTS
    # AuthMiddlewareStack          → attaches request.user to the connection
    # URLRouter                   → routes ws:// paths to consumers
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                logs.routing.websocket_urlpatterns
            )
        )
    ),
})