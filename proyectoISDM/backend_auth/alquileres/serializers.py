from rest_framework import serializers
from .models import Alquiler, DetalleAlquiler
from productos.serializers import ProductoSerializer  # Serializador para Producto

# Serializador para DetalleAlquiler
class DetalleAlquilerSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer()  # Serializamos el producto

    class Meta:
        model = DetalleAlquiler
        fields = ['producto', 'cantidad', 'precio_unitario']

# Serializador para Alquiler
class AlquilerSerializer(serializers.ModelSerializer):
    productos = DetalleAlquilerSerializer(many=True)  # Relación con los productos del alquiler

    class Meta:
        model = Alquiler
        fields = ['id_alquiler', 'fecha_hora_alquiler', 'fecha_hora_devolucion', 'estado', 'monto_total', 'productos']
