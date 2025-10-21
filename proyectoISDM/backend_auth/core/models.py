from django.db import models
from django.contrib.auth.models import User


# ----------------------------
# CATEGORÍA
# ----------------------------
class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=100)

    class Meta:
        db_table = 'categoria'

    def __str__(self):
        return self.nombre_categoria


# ----------------------------
# PRODUCTOS
# ----------------------------
class Producto(models.Model):
    id_productos = models.AutoField(primary_key=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, db_column='id_categoria')
    nombre_prod = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    foto_producto = models.BinaryField(null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'productos'

    def __str__(self):
        return self.nombre_prod


from django.contrib.auth.models import User

# ----------------------------
# EMPLEADOS
# ----------------------------
class Empleado(models.Model):
    id_empleados = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='empleado')
    nombre = models.CharField(max_length=100, blank=True)
    apellido = models.CharField(max_length=100, blank=True)
    dni = models.CharField(max_length=20, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    fecha_ingreso = models.DateField(null=True, blank=True)
    fecha_egreso = models.DateField(null=True, blank=True)
    direccion = models.CharField(max_length=200, blank=True)

    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'empleados'

    def __str__(self):
        return f"{self.nombre} {self.apellido}" if self.nombre else (self.user.username if self.user else "Sin usuario")


# ----------------------------
# CLIENTES
# ----------------------------
class Cliente(models.Model):
    id_clientes = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True)
    domicilio_cli = models.CharField(max_length=200)
    localidad_cli = models.CharField(max_length=100)
    dni_cli = models.CharField(max_length=20)
    email_cli = models.EmailField()

    class Meta:
        db_table = 'clientes'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


# ----------------------------
# ALQUILERES
# ----------------------------
class Alquiler(models.Model):
    id_alquiler = models.AutoField(primary_key=True)
    fecha_hora_alquiler = models.DateTimeField()
    fecha_hora_devolucion = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=50)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'alquileres'

    def __str__(self):
        return f"Alquiler #{self.id_alquiler}"


# ----------------------------
# DETALLE ALQUILERES
# ----------------------------
class DetAlquiler(models.Model):
    id_det_alquiler = models.AutoField(primary_key=True)
    alquiler = models.ForeignKey(Alquiler, on_delete=models.CASCADE, db_column='id_alquiler')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_productos')
    cantidad = models.PositiveIntegerField()
    precio_unit = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'det_alquileres'

    def __str__(self):
        return f"Detalle #{self.id_det_alquiler} - Alquiler {self.alquiler.id_alquiler}"


# ----------------------------
# PEDIDOS
# ----------------------------
class Pedido(models.Model):
    id_pedido = models.AutoField(primary_key=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, db_column='id_clientes')
    alquiler = models.ForeignKey(Alquiler, on_delete=models.CASCADE, db_column='id_alquiler', null=True, blank=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, db_column='id_empleados')
    fecha_ped = models.DateField()
    fecha_hora_evento = models.DateTimeField()
    fecha_hora_devolucion = models.DateTimeField(null=True, blank=True)
    estado_ped = models.CharField(max_length=50)
    total_ped = models.DecimalField(max_digits=10, decimal_places=2)
    forma_pago = models.CharField(max_length=50)

    class Meta:
        db_table = 'pedidos'

    def __str__(self):
        return f"Pedido #{self.id_pedido}"


# ----------------------------
# DETALLE PEDIDOS
# ----------------------------
class DetPedido(models.Model):
    id_det_pedidos = models.AutoField(primary_key=True)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_productos')
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, db_column='id_pedidos')

    class Meta:
        db_table = 'det_pedidos'

    def __str__(self):
        return f"Detalle Pedido #{self.id_det_pedidos}"


# ----------------------------
# INCIDENTES
# ----------------------------
class Incidente(models.Model):
    id_incidente = models.AutoField(primary_key=True)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, db_column='id_productos')
    alquiler = models.ForeignKey(Alquiler, on_delete=models.CASCADE, db_column='id_alquiler', null=True, blank=True)
    fecha_incidente = models.DateField(auto_now_add=True)
    descripcion = models.TextField()
    estado_incidente = models.CharField(max_length=50, default="Abierto")

    class Meta:
        db_table = 'incidentes'

    def __str__(self):
        return f"Incidente #{self.id_incidente} - {self.estado_incidente}"


# ----------------------------
# CAJA
# ----------------------------
class Caja(models.Model):
    id_caja = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, db_column='id_empleados')
    fecha_apertura = models.DateTimeField()
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    ingreso_caja = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    egreso_caja = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_inicial = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_final = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = 'caja'

    def __str__(self):
        return f"Caja #{self.id_caja}"


# ----------------------------
# PAGOS
# ----------------------------
class Pago(models.Model):
    id_pago = models.AutoField(primary_key=True)
    caja = models.ForeignKey(Caja, on_delete=models.CASCADE, db_column='id_caja')
    fecha_pago = models.DateField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    comprobante = models.CharField(max_length=100)
    metodo_pago = models.CharField(max_length=50)

    class Meta:
        db_table = 'pagos'

    def __str__(self):
        return f"Pago #{self.id_pago}"


# ----------------------------
# FACTURAS
# ----------------------------
class Factura(models.Model):
    id_factura = models.AutoField(primary_key=True)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, db_column='id_pedidos')
    pago = models.ForeignKey(Pago, on_delete=models.CASCADE, db_column='id_pago')
    fecha_emision = models.DateField()
    monto_factura = models.DecimalField(max_digits=10, decimal_places=2)
    estado_factura = models.CharField(max_length=50)

    class Meta:
        db_table = 'facturas'

    def __str__(self):
        return f"Factura #{self.id_factura}"


# ----------------------------
# ENTREGAS
# ----------------------------
class Entrega(models.Model):
    id_entrega = models.AutoField(primary_key=True)
    alquiler = models.ForeignKey(Alquiler, on_delete=models.CASCADE, db_column='id_alquiler')
    fecha_hora_entrega = models.DateTimeField()
    direccion = models.CharField(max_length=200)
    estado_entrega = models.CharField(max_length=50)
    responsable_entrega = models.CharField(max_length=100)

    class Meta:
        db_table = 'entregas'

    def __str__(self):
        return f"Entrega #{self.id_entrega}"


# ----------------------------
# DETALLE ENTREGA
class DetEntrega(models.Model):
    id_det_entrega = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, db_column='id_empleados')
    entrega = models.ForeignKey(Entrega, on_delete=models.CASCADE, db_column='id_entregas')
    cantidad_entregada = models.PositiveIntegerField()

    class Meta:
        db_table = 'det_entregas'

    def __str__(self):
        return f"Detalle Entrega #{self.id_det_entrega}"
    