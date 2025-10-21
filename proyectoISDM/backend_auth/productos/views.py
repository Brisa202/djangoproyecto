from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .models import Producto, Categoria
from .serializers import ProductoSerializer, CategoriaSerializer

class ProductoPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 50

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('nombre_categoria')
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ProductoPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre_prod', 'descripcion']
