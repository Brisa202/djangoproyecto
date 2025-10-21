from rest_framework import serializers
from .models import Incidente

class IncidenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidente
        fields = '__all__'  # Asegúrate de que incluya todos los campos del modelo

