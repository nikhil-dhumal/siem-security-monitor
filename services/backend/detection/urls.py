from django.urls import path
from .views import SimulationStateView, SimulationConfigureView, SimulationTriggerView

urlpatterns = [
    path('simulation/', SimulationStateView.as_view(), name='simulation-state'),
    path('simulation/configure/', SimulationConfigureView.as_view(), name='simulation-configure'),
    path('simulation/trigger/', SimulationTriggerView.as_view(), name='simulation-trigger'),
]
