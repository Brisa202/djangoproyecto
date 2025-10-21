# backend_auth/incidentes/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Incidente
from .serializers import IncidenteSerializer

# Listar todos los incidentes o crear uno nuevo
class IncidenteView(generics.ListCreateAPIView):
    queryset = Incidente.objects.all()
    serializer_class = IncidenteSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

# Crear un nuevo incidente (similar al anterior, pero específicamente para POST)
class IncidenteCreateView(generics.CreateAPIView):
    queryset = Incidente.objects.all()
    serializer_class = IncidenteSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden crear un incidente
