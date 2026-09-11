from django.urls import path
from . import views

app_name = "ventas"
urlpatterns = [
    path("ventas/grafica/", views.sales_chart, name="sales_chart"),
    path("ventas/datos/", views.SalesDataView.as_view(), name="sales_data"),
    path("", views.lista_productos, name="lista_productos"),
    path("carrito/", views.ver_carrito, name="ver_carrito"),
    path("carrito/agregar/<int:producto_id>/", views.agregar_carrito, name="agregar_carrito"),
    path("carrito/eliminar/<int:producto_id>/", views.eliminar_carrito, name="eliminar_carrito"),
    path("checkout/", views.procesar_pedido, name="procesar_pedido"),
    path("confirmacion/", views.confirmacion_pedido, name="confirmacion_pedido"),
]
