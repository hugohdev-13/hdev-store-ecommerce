"""Catálogo simulado y flujo de compra con sesiones, sin modelos."""
from decimal import Decimal
from uuid import uuid4

from django.contrib import messages
from django.http import Http404, JsonResponse
from django.shortcuts import redirect, render
from django.views import View
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .forms import PedidoForm, RegistroUsuarioForm


PRODUCTOS = [
    {"id": 1, "nombre": "Laptop HDev Pro 14", "descripcion": "Ryzen 7, 16 GB de RAM y SSD de 512 GB para programar donde quieras.", "precio": Decimal("15999.00"), "categoria": "Laptops"},
    {"id": 2, "nombre": "Monitor HDev Vision 27", "descripcion": "Pantalla QHD de 27 pulgadas con panel IPS para tu espacio de trabajo.", "precio": Decimal("4499.00"), "categoria": "Monitores"},
    {"id": 3, "nombre": "Teclado Mecánico HDev Key Pro", "descripcion": "Formato compacto de 75% y switches táctiles para escribir con comodidad.", "precio": Decimal("1299.00"), "categoria": "Periféricos"},
    {"id": 4, "nombre": "Mouse HDev Precision", "descripcion": "Conexión inalámbrica, seis botones y sensor de 3200 DPI.", "precio": Decimal("699.00"), "categoria": "Periféricos"},
    {"id": 5, "nombre": "Audífonos HDev Sound X", "descripcion": "Audio Bluetooth con cancelación de ruido para concentrarte.", "precio": Decimal("1899.00"), "categoria": "Audio"},
    {"id": 6, "nombre": "SSD NVMe HDev Storage 1TB", "descripcion": "Almacenamiento PCIe 4.0 con velocidades de hasta 5000 MB/s.", "precio": Decimal("1499.00"), "categoria": "Componentes"},
]


def obtener_producto(producto_id):
    for producto in PRODUCTOS:
        if producto["id"] == producto_id:
            return producto
    raise Http404("El producto no existe.")


def resumen_carrito(request):
    """Calcula importes desde el catálogo; el cliente solo aporta el ID."""
    carrito = request.session.get("carrito", {})
    items = []
    total = Decimal("0.00")
    for producto in PRODUCTOS:
        cantidad = carrito.get(str(producto["id"]), 0)
        if cantidad > 0:
            subtotal = producto["precio"] * cantidad
            items.append({**producto, "cantidad": cantidad, "subtotal": subtotal})
            total += subtotal
    return {"items": items, "total": total}


@require_GET
def lista_productos(request):
    return render(request, "ventas/ventas.html", {"productos": PRODUCTOS})


@require_POST
def agregar_carrito(request, producto_id):
    producto = obtener_producto(producto_id)
    carrito = request.session.get("carrito", {})
    clave = str(producto["id"])
    carrito[clave] = carrito.get(clave, 0) + 1
    # Reasignar la clave hace que Django guarde el cambio de la sesión.
    request.session["carrito"] = carrito
    return redirect("ventas:ver_carrito")


@require_GET
def ver_carrito(request):
    return render(request, "ventas/carrito.html", resumen_carrito(request))


@require_POST
def eliminar_carrito(request, producto_id):
    obtener_producto(producto_id)
    carrito = request.session.get("carrito", {})
    carrito.pop(str(producto_id), None)
    request.session["carrito"] = carrito
    return redirect("ventas:ver_carrito")


@require_http_methods(["GET", "POST"])
def procesar_pedido(request):
    resumen = resumen_carrito(request)
    if not resumen["items"]:
        return redirect("ventas:ver_carrito")
    formulario = PedidoForm(request.POST if request.method == "POST" else None)
    if request.method == "POST" and formulario.is_valid():
        # Copia independiente y serializable en JSON antes de vaciar el carrito.
        request.session["pedido"] = {
            "numero": f"HDEV-{uuid4().hex[:12].upper()}",
            "cliente": formulario.cleaned_data,
            "items": [
                {**item, "precio": str(item["precio"]), "subtotal": str(item["subtotal"])}
                for item in resumen["items"]
            ],
            "total": str(resumen["total"]),
        }
        request.session["carrito"] = {}
        return redirect("ventas:confirmacion_pedido")
    return render(request, "ventas/checkout.html", {**resumen, "formulario": formulario})


@require_GET
def confirmacion_pedido(request):
    pedido = request.session.get("pedido")
    if not pedido:
        return redirect("ventas:lista_productos")
    return render(request, "ventas/confirmacion.html", {"pedido": pedido})


class SalesDataView(View):
    """Importes académicos en MXN; no representan pedidos reales ni sesiones."""

    def get(self, request, *args, **kwargs):
        data = {
            "labels": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
            "sales": [12000, 18500, 14300, 22100, 19800, 26500],
        }
        return JsonResponse(data)


@require_GET
def sales_chart(request):
    return render(request, "ventas/sales_chart.html")


@require_http_methods(["GET", "POST"])
def registro_usuario(request):
    formulario = RegistroUsuarioForm(request.POST if request.method == "POST" else None)
    if request.method == "POST" and formulario.is_valid():
        formulario.save()
        messages.success(request, "Tu cuenta se creó correctamente.")
        return redirect("ventas:registro_usuario")
    return render(request, "ventas/registro.html", {"formulario": formulario})


@require_GET
def django_templates_demo(request):
    productos_demo = [
        {"nombre": "Laptop Gamer", "descripcion": "Equipo para desarrollo y entretenimiento", "precio": Decimal("24599.90"), "categoria": "computadoras"},
        {"nombre": "Monitor Full HD", "descripcion": "Monitor de 24 pulgadas para escritorio", "precio": Decimal("3899.50"), "categoria": "monitores"},
        {"nombre": "Teclado Mecánico", "descripcion": "Teclado para programación y gaming", "precio": Decimal("1499.00"), "categoria": "accesorios"},
        {"nombre": "Mouse Inalámbrico", "descripcion": "Mouse ergonómico de uso diario", "precio": Decimal("799.90"), "categoria": "accesorios"},
        {"nombre": "SSD 1 TB", "descripcion": "Unidad de almacenamiento de estado sólido", "precio": Decimal("1699.00"), "categoria": "almacenamiento"},
        {"nombre": "Memoria RAM 16 GB", "descripcion": "Memoria para ampliar el rendimiento", "precio": Decimal("1299.00"), "categoria": "componentes"},
    ]
    return render(request, "ventas/django_templates.html", {
        "titulo": "django templates",
        "subtitulo": "Filtros, ciclos, herencia e include",
        "productos": productos_demo,
    })
