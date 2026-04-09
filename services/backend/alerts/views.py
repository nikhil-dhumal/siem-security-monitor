from rest_framework import viewsets
from .models import Alert, Incident
from .serializers import AlertSerializer, IncidentSerializer

class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

class IncidentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
