# core/permissions.py

from rest_framework import permissions

class IsAdminGroup(permissions.BasePermission):
    """
    Permite el acceso solo si el usuario pertenece al grupo 'Admin'.
    También permite el acceso al superusuario (is_superuser).
    """
    def has_permission(self, request, view):
        # Un superusuario siempre tiene acceso
        if request.user.is_superuser:
            return True
            
        # Verifica si el usuario está autenticado Y pertenece al grupo 'Admin'
        return request.user.is_authenticated and request.user.groups.filter(name='Admin').exists()