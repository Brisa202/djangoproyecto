from django.db import models

class Alquiler(models.Model):
    # Identificador único para el alquiler
    id_alquiler = models.CharField(max_length=20, unique=True)
    
    # Fechas del alquiler y devolución
    fecha_hora_alquiler = models.DateTimeField()
    fecha_hora_devolucion = models.DateTimeField()
    
    # Estado del alquiler (activo, finalizado, cancelado)
    ESTADOS = (
        ('activo', 'Activo'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    )
    estado = models.CharField(max_length=20, choices=ESTADOS, default='activo')
    
    # Monto total del alquiler
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Alquiler {self.id_alquiler} - Estado: {self.estado}"

from django.db import models
from productos.models import Producto  # Relación con el modelo Producto

class DetalleAlquiler(models.Model):
    alquiler = models.ForeignKey('Alquiler', on_delete=models.CASCADE)  # Relación con Alquiler
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)  # Relación con Producto
    cantidad = models.PositiveIntegerField(default=1)  # Cantidad del producto en alquiler
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)  # Precio del producto

    def __str__(self):
        return f"Alquiler {self.alquiler.id_alquiler} - Producto {self.producto.nombre}"
