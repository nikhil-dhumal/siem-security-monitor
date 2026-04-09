from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
import redis
import json
import os
from .models import RuleConfig
from .serializers import RuleConfigSerializer

# Redis for agent config updates
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

class RuleConfigViewSet(viewsets.ModelViewSet):
    queryset = RuleConfig.objects.all()
    serializer_class = RuleConfigSerializer
    http_method_names = ['get', 'patch', 'put', 'head', 'options']

SIMULATION_STATE = {
    'status': 'ready',
    'action': None,
    'template': None,
    'agent_probabilities': {
        'auth': 0.2,
        'network': 0.15,
        'file': 0.1,
        'vpn': 0.1,
        'web': 0.15,
        'dns': 0.1,
        'process': 0.2,
    },
    'detailed_probabilities': {
        'auth': {
            'ssh_login_success': 0.1,
            'ssh_login_failure': 0.01,
            'invalid_user': 0.05,
            'sudo_command': 0.74,
            'user_logout': 0.1,
        },
        'web': {
            'page_access': 0.46,
            'login_request': 0.05,
            'admin_access_denied': 0.01,
            'directory_traversal': 0.01,
            'api_access': 0.46,
        },
        'dns': {
            'dns_query': 0.3,
            'internal_lookup': 0.3,
            'suspicious_domain': 0.01,
            'cloud_lookup': 0.3,
            'dns_failure': 0.09,
        },
        'process': {
            'normal_process': 0.85,
            'admin_command': 0.03,
            'network_scan': 0.01,
            'reverse_shell': 0.01,
            'file_download': 0.1,
        },
        'file_access': {
            'file_read': 0.55,
            'file_write': 0.4,
            'sensitive_file_read': 0.01,
            'file_delete': 0.05,
            'config_change': 0.04,
        },
    },
    'event_rate': 1,
}

class SimulationStateView(APIView):
    def get(self, request):
        return Response(SIMULATION_STATE)

class SimulationConfigureView(APIView):
    def post(self, request):
        payload = request.data
        agent_probabilities = payload.get('agentProbabilities', {})
        detailed_probabilities = payload.get('detailedProbabilities', {})
        event_rate = payload.get('eventRate', 1)

        SIMULATION_STATE['agent_probabilities'] = agent_probabilities
        SIMULATION_STATE['detailed_probabilities'] = detailed_probabilities
        SIMULATION_STATE['event_rate'] = event_rate
        SIMULATION_STATE['status'] = SIMULATION_STATE.get('status', 'ready')

        config_update = {
            'type': 'config_update',
            'log_category_weights': agent_probabilities,
            'log_probabilities': detailed_probabilities,
            'log_rate_per_sec': event_rate,
        }
        try:
            redis_client.publish('simulation_config', json.dumps(config_update))
        except Exception as e:
            print(f"Failed to publish simulation config: {e}")

        return Response({
            'status': 'configured',
            'configuration': payload,
        })

class SimulationTriggerView(APIView):
    def post(self, request):
        action = request.data.get('action')
        if action not in ['start', 'stop', 'reset']:
            SIMULATION_STATE['template'] = action
        else:
            SIMULATION_STATE['template'] = None if action == 'reset' else SIMULATION_STATE.get('template')

        if action == 'start':
            SIMULATION_STATE['status'] = 'running'
        elif action == 'stop':
            SIMULATION_STATE['status'] = 'stopped'
        elif action == 'reset':
            SIMULATION_STATE['status'] = 'ready'

        control_payload = {
            'type': 'control',
            'action': action,
            'template': action if action not in ['start', 'stop', 'reset'] else None,
        }
        try:
            redis_client.publish('simulation_control', json.dumps(control_payload))
        except Exception as e:
            print(f"Failed to publish simulation control: {e}")

        return Response({
            'status': 'triggered',
            'action': action,
        })
