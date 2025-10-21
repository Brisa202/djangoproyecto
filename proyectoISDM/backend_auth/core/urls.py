# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import EmpleadoDetailViewSet
from . import views

# 🔹 Importaciones de tus vistas
from .views import (
    LoginView,
    UserInfoView,
    AdminUserCreateView,
    EmployeeUserCreateView,
    EmployeeViewSet,
    DashboardSummaryView,
    GroupViewSet,
    ProductoViewSet,
    ClienteViewSet,
    PedidoViewSet,
    FacturaViewSet,
    EntregaViewSet,
    PagoViewSet,
    IncidenteViewSet,
    CajaViewSet,
    CategoriaViewSet,
)

# 🔹 Router principal (para todos tus modelos)
router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'productos', ProductoViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'facturas', FacturaViewSet)
router.register(r'entregas', EntregaViewSet)
router.register(r'pagos', PagoViewSet)
router.register(r'caja', CajaViewSet, basename='caja')
router.register(r'incidentes', IncidenteViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'empleados-detail', EmpleadoDetailViewSet, basename='empleado-detail')




# 🔹 Rutas de tu API
urlpatterns = [
    # 🔐 Login personalizado (usado por React)
    path('login/', LoginView.as_view(), name='custom-login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # 🔁 Refresh token JWT estándar
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 👤 Gestión de usuarios
    path('users/create/admin/', AdminUserCreateView.as_view(), name='admin-user-create'),
    path('users/create/employee/', EmployeeUserCreateView.as_view(), name='employee-user-create'),
    path('user/info/', UserInfoView.as_view(), name='user_info'),
    # 👁️ Detalles del empleado
    path('empleados-detail/<int:pk>/', views.EmpleadoDetailViewSet.as_view({'get': 'retrieve'}), name='empleado-detail'),


    # 📊 Dashboard (panel de control)
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),

    # 📦 CRUDs (automáticos desde router)
    path('', include(router.urls)),
]

