from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.LogSummaryView.as_view()),
    path('timeline/', views.LogTimelineView.as_view()),
    path('categories/', views.LogCategoriesView.as_view()),
    path('event-types/', views.LogEventTypesView.as_view()),
    path('geo/', views.LogGeoView.as_view()),
    path('top-ips/', views.TopIPsView.as_view()),
    path('top-hosts/', views.TopHostsView.as_view()),
    path('top-users/', views.TopUsersView.as_view()),
    path('outcomes/', views.outcomes),
]
