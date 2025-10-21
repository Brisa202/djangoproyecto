from django.db import models
from productos.models import Producto
from alquileres.models import Alquiler

class Incidente(models.Model):
    # Relación con Producto y Alquiler (uno de estos puede ser opcional)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, null=True, blank=True)
    alquiler = models.ForeignKey(Alquiler, on_delete=models.CASCADE, null=True, blank=True)
    
    # Atributos
    fecha_incidente = models.DateTimeField(auto_now_add=True)
    descripcion = models.TextField()
    
    # Estados del incidente
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('no_resuelto', 'No Resuelto'),
        ('resuelto', 'Resuelto'),
    )
    estado_incidente = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    
    def __str__(self):
        return f"Incidente {self.id} - Estado: {self.estado_incidente}"  # ✅ CAMBIO: id_incidente → id
    
    class Meta:
        verbose_name = "Incidente"
        verbose_name_plural = "Incidentes"
        ordering = ['-fecha_incidente']  # Los más recientes primero
