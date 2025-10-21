from django.urls import path
from .views import IncidenteView , IncidenteCreateView


urlpatterns = [
    path('api/incidentes/', IncidenteView.as_view(), name='incidente_list'),  # Para listar y crear incidentes
    path('api/incidentes/create/', IncidenteCreateView.as_view(), name='incidente_create'), 
]
