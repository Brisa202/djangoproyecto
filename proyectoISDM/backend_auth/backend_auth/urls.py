# backend_auth/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# ✅ Importa todo desde core.views (todas tus vistas están allí)
from core.views import (
    GroupViewSet,
    AdminUserCreateView,
    EmployeeUserCreateView,
    EmployeeViewSet,
    UserInfoView,
    DashboardSummaryView,
    ProductoViewSet,
    ClienteViewSet,
    PedidoViewSet,
    FacturaViewSet,
    EntregaViewSet,
    PagoViewSet,
    IncidenteViewSet,
    CajaViewSet,

)

# 🔹 Router DRF para tus modelos
router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'productos', ProductoViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'entregas', EntregaViewSet)
router.register(r'pagos', PagoViewSet)
router.register(r'incidentes', IncidenteViewSet)
router.register(r'caja', CajaViewSet, basename='caja')

urlpatterns = [
    # Panel de administración
    path('admin/', admin.site.urls),
    path('', include('incidentes.urls')), 
    # 🌐 Incluye todas las rutas de la app core (token, login, dashboard, etc.)
    path('api/', include('core.urls')),
    path('api/', include('incidentes.urls')),
   
    
    # 🔐 Usuarios y roles
    path('api/', include(router.urls)),  # esto mantiene tus rutas de CRUD
    path('api/users/create/admin/', AdminUserCreateView.as_view(), name='admin-create-user'),
    path('api/users/create/employee/', EmployeeUserCreateView.as_view(), name='employee-create-user'),
    path('api/users/info/', UserInfoView.as_view(), name='user-info'),
    

    # 📊 Dashboard (redundante, pero lo dejamos por claridad)
    path('api/dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]

# Archivos estáticos y media (para imágenes, etc.)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


