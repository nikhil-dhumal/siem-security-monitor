from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncHour
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LogEvent
from .serializers import LogEventSerializer


class LogEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LogEvent.objects.all()
    serializer_class = LogEventSerializer


class LogSummaryView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        return Response({
            'total_events': qs.count(),
            'unique_src_ips': qs.exclude(src_ip=None).values('src_ip').distinct().count(),
            'unique_hosts': qs.exclude(host=None).values('host').distinct().count(),
            'failure_count': qs.filter(outcome__in=['failure', 'failed', 'blocked', 'denied']).count(),
            'success_count': qs.filter(outcome__in=['success', 'allow', 'allowed']).count(),
            'latest_event': qs.order_by('-timestamp').first().timestamp if qs.exists() else None,
        })


class LogTimelineView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        timeline = (
            qs.annotate(bucket=TruncHour('timestamp'))
              .values('bucket')
              .annotate(count=Count('id'))
              .order_by('bucket')
        )
        return Response(list(timeline))


class LogCategoriesView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        categories = qs.values('category').annotate(count=Count('id')).order_by('-count')
        return Response(list(categories))


class LogEventTypesView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        event_types = qs.values('event_type').annotate(count=Count('id')).order_by('-count')
        return Response(list(event_types))


class LogGeoView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        geo = qs.values('src_ip', 'category').annotate(count=Count('id')).order_by('-count')
        return Response(list(geo))


class TopIPsView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        top_ips = qs.values('src_ip').annotate(count=Count('id')).order_by('-count')[:20]
        return Response(list(top_ips))


class TopHostsView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        top_hosts = qs.values('host').annotate(count=Count('id')).order_by('-count')[:20]
        return Response(list(top_hosts))


class TopUsersView(APIView):
    def get(self, request):
        hours = int(request.GET.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        qs = LogEvent.objects.filter(timestamp__gte=since)
        top_users = qs.values('user').annotate(count=Count('id')).order_by('-count')[:20]
        return Response(list(top_users))


@api_view(['GET'])
def outcomes(request):
    hours = int(request.GET.get('hours', 24))
    since = timezone.now() - timedelta(hours=hours)
    qs = LogEvent.objects.filter(timestamp__gte=since)
    data = qs.values('outcome').annotate(count=Count('id')).order_by('-count')
    return Response(list(data))
