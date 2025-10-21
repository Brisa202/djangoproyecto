from django.contrib.auth.models import User, Group
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# Serializers
from .serializers import GroupSerializer, UserCreationSerializer


# --- Vista para obtener la lista de grupos ---
class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permite listar los roles (Grupos) de Django.
    Solo accesible por usuarios administradores.
    """
    permission_classes = [IsAdminUser]
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


# --- Vista para crear usuarios con rol asignado ---
class AdminUserCreateView(APIView):
    """
    Crea un nuevo usuario y lo asigna a un grupo específico (rol).
    Solo accesible por administradores.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, format=None):
        serializer = UserCreationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # ✅ ahora usamos group_id (viene del formulario)
            group_id = request.data.get("group_id")
            if group_id:
                try:
                    grupo = Group.objects.get(id=group_id)
                    user.groups.add(grupo)
                except Group.DoesNotExist:
                    return Response(
                        {"error": "El rol (ID) especificado no existe."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # si no se elige grupo, asigna "Empleado" por defecto
                grupo, _ = Group.objects.get_or_create(name="Empleado")
                user.groups.add(grupo)

            return Response({"message": "Usuario creado y rol asignado con éxito."},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- NUEVA vista para obtener datos del usuario logueado ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Devuelve los datos del usuario logueado (username, email, rol).
    """
    user = request.user

    # Determinar el rol
    if user.is_superuser:
        rol = "Administrador"
    else:
        grupos = user.groups.values_list("name", flat=True)
        rol = grupos[0] if grupos else "Empleado"

    return Response({
        "username": user.username,
        "email": user.email,
        "rol": rol
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """Devuelve la lista de usuarios con su rol"""
    users = User.objects.all().values('id', 'username', 'email')
    data = []
    for u in users:
        user_obj = User.objects.get(id=u['id'])
        groups = user_obj.groups.values_list('name', flat=True)
        u['role'] = groups[0] if groups else "Sin rol"
        data.append(u)
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        user.delete()
        return Response({"message": "Usuario eliminado correctamente."}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    """Obtener o actualizar un usuario por su ID"""
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Mostrar datos del usuario
        groups = user.groups.values_list('name', flat=True)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "group_id": user.groups.first().id if user.groups.exists() else None,
            "group_name": groups[0] if groups else "Sin rol",
        })

    elif request.method == 'PUT':
        # Actualizar datos del usuario
        data = request.data
        user.username = data.get("username", user.username)
        user.email = data.get("email", user.email)
        user.save()

        group_id = data.get("group_id")
        if group_id:
            try:
                new_group = Group.objects.get(id=group_id)
                user.groups.clear()
                user.groups.add(new_group)
            except Group.DoesNotExist:
                return Response({"error": "Grupo no válido."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Usuario actualizado correctamente."}, status=status.HTTP_200_OK)
    
