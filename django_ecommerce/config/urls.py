from django.contrib import admin
from django.urls import include, path
from product.api_views import ProductListAPIView

urlpatterns = [
    path("api/productos/", ProductListAPIView.as_view(), name="api_productos"),
    path("admin/", admin.site.urls),
    path("", include("ventas.urls")),
]
