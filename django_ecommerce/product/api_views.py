from rest_framework.generics import ListAPIView

from .models import Product
from .pagination import HDevPageNumberPagination
from .serializers import ProductSerializer


class ProductListAPIView(ListAPIView):
    queryset = Product.objects.all().order_by("pk")
    serializer_class = ProductSerializer
    pagination_class = HDevPageNumberPagination
