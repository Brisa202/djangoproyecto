# core/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Producto, Categoria, Cliente, Pedido, Factura, Entrega, Pago, Incidente, Caja, Empleado

# ========================
# 🔐 USUARIOS Y ROLES
# ========================

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            is_active=True  # 🔥 AGREGAR ESTA LÍNEA
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserInfoSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    group_id = serializers.IntegerField(write_only=True, required=False)
    
    # 🔥 NUEVO: Agregar el id_empleados
    id_empleados = serializers.SerializerMethodField()
    
    # 👤 Campos adicionales para el perfil del empleado
    nombre = serializers.CharField(source='first_name', required=False, allow_blank=True)
    apellido = serializers.CharField(source='last_name', required=False, allow_blank=True)
    dni = serializers.CharField(required=False, allow_blank=True, default='')
    telefono = serializers.CharField(required=False, allow_blank=True, default='')
    direccion = serializers.CharField(required=False, allow_blank=True, default='')
    fecha_ingreso = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'id_empleados', 'username', 'email', 'roles', 'group_id',  # 👈 Agregado id_empleados
            'nombre', 'apellido', 'dni', 'telefono', 'direccion', 'fecha_ingreso'
        ]
        read_only_fields = ['id', 'id_empleados']

    def get_roles(self, obj):
        return list(obj.groups.values_list('name', flat=True))
    
    # 🔥 NUEVO MÉTODO: Obtener id_empleados
    def get_id_empleados(self, obj):
        """Obtiene el id_empleados de la tabla empleados"""
        try:
            return obj.empleado.id_empleados
        except Empleado.DoesNotExist:
            return None
    
    def to_representation(self, instance):
        """
        Personaliza la salida del serializer para incluir campos vacíos
        cuando no existan en el modelo User
        """
        representation = super().to_representation(instance)
        
        # Asegurar que los campos opcionales siempre estén presentes
        if 'dni' not in representation or representation['dni'] is None:
            representation['dni'] = ''
        if 'telefono' not in representation or representation['telefono'] is None:
            representation['telefono'] = ''
        if 'direccion' not in representation or representation['direccion'] is None:
            representation['direccion'] = ''
        if 'fecha_ingreso' not in representation or representation['fecha_ingreso'] is None:
            representation['fecha_ingreso'] = ''
            
        return representation
    
    def update(self, instance, validated_data):
        """
        Actualiza el usuario con sus datos personales y grupo
        """
        group_id = validated_data.pop('group_id', None)
        
        # Actualizar campos básicos
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        # Actualizar grupo si se proporciona
        if group_id:
            try:
                new_group = Group.objects.get(id=group_id)
                instance.groups.clear()
                instance.groups.add(new_group)
            except Group.DoesNotExist:
                raise serializers.ValidationError({"group_id": "El grupo especificado no existe."})
        
        return instance

# ========================
# 👤 EMPLEADO COMPLETO
# ========================

class EmpleadoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    roles = serializers.SerializerMethodField()
    
    class Meta:
        model = Empleado
        fields = ['id_empleados', 'username', 'email', 'nombre', 'apellido', 
                  'dni', 'telefono', 'direccion', 'fecha_ingreso', 'roles']
    
    def get_roles(self, obj):
        if obj.user:
            return list(obj.user.groups.values_list('name', flat=True))
        return []
    
    def update(self, instance, validated_data):
        # Actualizar campos del Empleado
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.apellido = validated_data.get('apellido', instance.apellido)
        instance.dni = validated_data.get('dni', instance.dni)
        instance.telefono = validated_data.get('telefono', instance.telefono)
        instance.direccion = validated_data.get('direccion', instance.direccion)
        instance.fecha_ingreso = validated_data.get('fecha_ingreso', instance.fecha_ingreso)
        instance.save()
        
        return instance


# ========================
# 📦 MODELOS
# ========================

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = '__all__'


class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'


class EntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = '__all__'


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'


class IncidenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidente
        fields = '__all__'


class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'