from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/logs/$', consumers.LogStreamConsumer.as_asgi()),
    re_path(r'ws/stats/$', consumers.StatsConsumer.as_asgi()),
]