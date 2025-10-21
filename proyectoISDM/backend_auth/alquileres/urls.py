from django.urls import path
from .views import AlquilerView

urlpatterns = [
    path('api/alquileres/', AlquilerView.as_view(), name='alquiler_list'),  # Para listar y crear alquileres
]
