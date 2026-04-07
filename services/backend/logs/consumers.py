import json
import asyncio
from datetime import timedelta

from django.utils import timezone
from django.db.models import Count

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Log
from .serializers import LogListSerializer

@database_sync_to_async
def get_latest_logs(limit=20):
    logs = Log.objects.order_by('-timestamp')[:limit]
    return LogListSerializer(logs, many=True).data

@database_sync_to_async
def get_stats(hours=24):
    since = timezone.now() - timedelta(hours=hours)
    qs    = Log.objects.filter(timestamp__gte=since)
    total         = qs.count()
    unique_ips    = qs.exclude(src_ip=None).values('src_ip').distinct().count()
    unique_hosts  = qs.exclude(host=None).values('host').distinct().count()
    failure_count = qs.filter(
        outcome__in=['failure', 'failed', 'blocked', 'denied']
    ).count()
    success_count = qs.filter(
        outcome__in=['success', 'allow', 'allowed']
    ).count()
    categories = list(
        qs.values('category')
          .annotate(count=Count('id'))
          .order_by('-count')[:6]
    )
    return {
        'type':           'stats',
        'total_events':   total,
        'unique_src_ips': unique_ips,
        'unique_hosts':   unique_hosts,
        'failure_count':  failure_count,
        'success_count':  success_count,
        'categories':     categories,
        'hours':          hours,
    }

class LogStreamConsumer(AsyncWebsocketConsumer):
    GROUP_NAME = 'logs_stream'

    async def connect(self):
        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()
        recent = await get_latest_logs(limit=20)
        await self.send(text_data=json.dumps({
            'type': 'initial_logs',
            'logs': list(recent),
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    async def receive(self, text_data):
        try:
            data  = json.loads(text_data)
            hours = data.get('hours', 24)
            limit = data.get('limit', 50)
            logs  = await get_latest_logs(limit=limit)
            await self.send(text_data=json.dumps({
                'type': 'initial_logs',
                'logs': list(logs),
            }))
        except Exception:
            pass

    async def new_log(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_log',
            'log':  event['log'],
        }))

class StatsConsumer(AsyncWebsocketConsumer):
    REFRESH_SECONDS = 5

    async def connect(self):
        await self.accept()
        self.running = True
        stats = await get_stats(hours=24)
        await self.send(text_data=json.dumps(stats))
        asyncio.ensure_future(self._stats_loop())

    async def disconnect(self, close_code):
        self.running = False

    async def receive(self, text_data):
        try:
            data  = json.loads(text_data)
            hours = int(data.get('hours', 24))
            self._hours = hours
            stats = await get_stats(hours=hours)
            await self.send(text_data=json.dumps(stats))
        except Exception:
            pass

    async def _stats_loop(self):
        hours = getattr(self, '_hours', 24)
        while self.running:
            await asyncio.sleep(self.REFRESH_SECONDS)
            if not self.running:
                break
            try:
                hours = getattr(self, '_hours', 24)
                stats = await get_stats(hours=hours)
                await self.send(text_data=json.dumps(stats))
            except Exception:
                pass
