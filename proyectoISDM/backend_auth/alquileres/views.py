from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Alquiler
from .serializers import AlquilerSerializer

class AlquilerView(APIView):
    def get(self, request):
        # Obtener todos los alquileres
        alquileres = Alquiler.objects.all()
        serializer = AlquilerSerializer(alquileres, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Crear un nuevo alquiler
        serializer = AlquilerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Guarda el alquiler
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

