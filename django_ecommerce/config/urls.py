from django.contrib import admin
from django.urls import include, path
from product.api_views import ProductListAPIView
from rest_framework.authtoken.views import obtain_auth_token
from ventas.api_views import PerfilUsuarioAPIView, RegistroAPIView, OrderCreateAPIView

urlpatterns = [
    path("api/productos/", ProductListAPIView.as_view(), name="api_productos"),
    path("api/token/", obtain_auth_token, name="api_token"),
    path("api/perfil/", PerfilUsuarioAPIView.as_view(), name="api_perfil"),
    path("api/registro/", RegistroAPIView.as_view(), name="api_registro"),
    path("api/ordenes/", OrderCreateAPIView.as_view(), name="api_ordenes"),
    path("admin/", admin.site.urls),
    path("", include("ventas.urls")),
]
