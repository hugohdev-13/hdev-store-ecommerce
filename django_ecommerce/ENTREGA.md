# Vistas del e-commerce

Entrega académica de HDev Store. Implementación Django independiente del frontend React.

## Archivos creados

Todos estos archivos están dentro de `django_ecommerce/`:

- `manage.py`, `requirements.txt`, `ENTREGA.md`.
- `config/__init__.py`, `config/settings.py`, `config/urls.py`, `config/asgi.py`, `config/wsgi.py`.
- `ventas/__init__.py`, `ventas/apps.py`, `ventas/forms.py`, `ventas/views.py`, `ventas/urls.py`, `ventas/tests.py`.
- `ventas/templates/ventas/base.html`, `ventas/templates/ventas/ventas.html`, `ventas/templates/ventas/carrito.html`, `ventas/templates/ventas/checkout.html`, `ventas/templates/ventas/confirmacion.html`.
- `ventas/static/ventas/estilos.css`.

Se generan localmente `venv/`, `.sessions/` y `__pycache__/`, excluidos de Git.

## Archivos existentes modificados

- `README.md`: se agregó la sección «Vistas del e-commerce — Django» conservando la documentación React.
- `.gitignore`: exclusiones del entorno Python, sesiones y archivos generados.
- `.prettierignore`: exclusiones de entornos, cachés y templates Django que el parser HTML de Prettier no interpreta.

No se modificaron archivos del frontend, sus dependencias ni sus pruebas.

## Funcionalidades y rutas

| Vista               | Método y URL                | Resultado                                               |
| ------------------- | --------------------------- | ------------------------------------------------------- |
| lista_productos     | GET `/`                     | Catálogo de seis productos simulados, HTTP 200          |
| ver_carrito         | GET `/carrito/`             | Cantidades, precios, subtotales y total, HTTP 200       |
| agregar_carrito     | POST `/carrito/agregar/1/`  | Guarda o incrementa cantidad en sesión, redirección 302 |
| eliminar_carrito    | POST `/carrito/eliminar/1/` | Elimina el producto completo, redirección 302           |
| procesar_pedido     | GET, POST `/checkout/`      | Formulario validado y pedido simulado                   |
| confirmacion_pedido | GET `/confirmacion/`        | Copia del pedido aunque el carrito esté vacío           |

Las rutas con ID aceptan cualquiera de los seis productos. ID desconocido: 404.
Agregar y eliminar requieren POST con CSRF. Checkout vacío: redirección al carrito.
Confirmación sin pedido: redirección al catálogo. POST inválido: HTTP 200 con errores.

El total se calcula con `Decimal`, usando precios del servidor. Se guardan los datos
validados y una copia de los productos antes de limpiar `request.session["carrito"]`.
Los importes de la copia se convierten a cadenas, compatibles con JSON.
La sesión se guarda en archivos del servidor durante una hora desde su última modificación.
No existen modelos ni almacenamiento de productos o pedidos en una base de datos.

## Comandos de ejecución

Desde PowerShell, para una instalación nueva:

```powershell
cd "D:\EBAC\Tercer Proyecto\HDev_Store\django_ecommerce"
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py check
python manage.py test
python manage.py runserver
```

Si no se puede activar el entorno, reemplazar `python` por
`.\venv\Scripts\python.exe` en los comandos posteriores a su creación.
No es necesario cambiar la política de PowerShell. Abrir http://127.0.0.1:8000/.
En este equipo el entorno ya está creado y Django está instalado.

`migrate` es opcional: no hay migraciones, y la configuración SQLite en memoria
solo permite usar los comandos administrativos estándar y `TestCase` sin crear una BD en disco.

## Validación

Validado con Python 3.12.10 y Django 5.2.17:

| Comando                                          | Resultado                                         |
| ------------------------------------------------ | ------------------------------------------------- |
| `python manage.py check`                         | `System check identified no issues (0 silenced).` |
| `python manage.py test`                          | 16 pruebas, `OK`                                  |
| `python manage.py migrate`                       | `No migrations to apply.`                         |
| `python manage.py findstatic ventas/estilos.css` | CSS localizado correctamente                      |
| `npm.cmd test`                                   | 19 pruebas React aprobadas                        |
| `npm.cmd run build`                              | TypeScript y compilación Vite correctos           |

Las pruebas Django verifican URLs y templates, cantidades y totales, eliminación,
404, métodos permitidos, campos obligatorios, correo y CP, rechazo de carrito vacío,
conservación del pedido tras recarga, reenvío secuencial, aislamiento de clientes y CSRF.
Agregar y confirmar se comprueban sin consultas a la BD. Los archivos de sesión de
pruebas se crean en carpetas temporales independientes y se eliminan al terminar.

## Código principal para el PDF

Orden sugerido: objetivo, estructura, configuración, URLs, vistas, formulario,
templates, pruebas y capturas. Los siguientes bloques son código real de la entrega.
Incluir también `config/settings.py` para explicar `INSTALLED_APPS`, `SessionMiddleware`,
`APP_DIRS`, `SESSION_ENGINE` y `SESSION_FILE_PATH`.

### config/urls.py

```python
from django.urls import include, path

urlpatterns = [path("", include("ventas.urls"))]
```

### ventas/urls.py

```python
from django.urls import path
from . import views

app_name = "ventas"
urlpatterns = [
    path("", views.lista_productos, name="lista_productos"),
    path("carrito/", views.ver_carrito, name="ver_carrito"),
    path("carrito/agregar/<int:producto_id>/", views.agregar_carrito, name="agregar_carrito"),
    path("carrito/eliminar/<int:producto_id>/", views.eliminar_carrito, name="eliminar_carrito"),
    path("checkout/", views.procesar_pedido, name="procesar_pedido"),
    path("confirmacion/", views.confirmacion_pedido, name="confirmacion_pedido"),
]
```

### ventas/views.py

```python
"""Catálogo simulado y flujo de compra con sesiones, sin modelos."""
from decimal import Decimal
from uuid import uuid4

from django.http import Http404
from django.shortcuts import redirect, render
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .forms import PedidoForm


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
```

### ventas/forms.py

```python
from django import forms


class PedidoForm(forms.Form):
    nombre = forms.CharField(label="Nombre", max_length=100)
    correo = forms.EmailField(label="Correo electrónico", max_length=254)
    direccion = forms.CharField(label="Dirección", max_length=200)
    ciudad = forms.CharField(label="Ciudad", max_length=100)
    codigo_postal = forms.RegexField(
        label="Código postal", regex=r"^[0-9]{5}$", max_length=5,
        error_messages={"invalid": "Escribe un código postal de cinco dígitos."},
        widget=forms.TextInput(attrs={"inputmode": "numeric", "autocomplete": "postal-code"}),
    )
```

### ventas/templates/ventas/ventas.html

```html
{% extends 'ventas/base.html' %} {% block title %}Catálogo | HDev Store{% endblock %} {% block
content %}
<p class="etiqueta">TU PRÓXIMO PROYECTO EMPIEZA AQUÍ</p>
<h1>Catálogo de productos</h1>
<p class="intro">Equipa tu espacio con tecnología para programar, crear y trabajar a tu ritmo.</p>
<div class="catalogo">
  {% for producto in productos %}
  <article class="panel producto">
    <p class="etiqueta">{{ producto.categoria }}</p>
    <h2>{{ producto.nombre }}</h2>
    <p>{{ producto.descripcion }}</p>
    <p class="precio">${{ producto.precio|floatformat:2 }} MXN</p>
    <form method="post" action="{% url 'ventas:agregar_carrito' producto.id %}">
      {% csrf_token %}<button type="submit">
        Agregar al carrito<span class="sr-only">: {{ producto.nombre }}</span>
      </button>
    </form>
  </article>
  {% endfor %}
</div>
{% endblock %}
```

### ventas/templates/ventas/checkout.html

```html
{% extends 'ventas/base.html' %} {% block title %}Checkout | HDev Store{% endblock %} {% block
content %}
<h1>Finalizar compra</h1>
<p class="intro">Completa tus datos de envío para confirmar este pedido de demostración.</p>
<div class="checkout">
  <section class="panel">
    <h2>Datos de envío</h2>
    <form method="post">
      {% csrf_token %} {% if formulario.errors %}
      <p role="alert" class="error">Revisa los campos indicados antes de confirmar.</p>
      {% endif %} {{ formulario.as_p }}
      <button type="submit">Confirmar pedido</button>
    </form>
  </section>
  <aside class="panel">
    <h2>Resumen del pedido</h2>
    <ul class="resumen">
      {% for item in items %}
      <li>
        <strong>{{ item.nombre }}</strong><br />Cantidad: {{ item.cantidad }} · ${{
        item.precio|floatformat:2 }} MXN c/u<br />Subtotal: ${{ item.subtotal|floatformat:2 }} MXN
      </li>
      {% endfor %}
    </ul>
    <p class="precio">Total: ${{ total|floatformat:2 }} MXN</p>
    <a href="{% url 'ventas:ver_carrito' %}">Volver al carrito</a>
  </aside>
</div>
{% endblock %}
```

### Otros archivos para evidenciar

- `ventas/templates/ventas/carrito.html`: ciclo de productos, subtotal, total y formulario POST de eliminación.
- `ventas/templates/ventas/confirmacion.html`: lectura del pedido independiente del carrito.
- `ventas/tests.py`: incluir especialmente `test_agregar_redirige_y_guarda_sesion_sin_consultas`, `test_compra_conserva_pedido_tras_vaciar_y_recargar` y `test_todas_las_urls_resuelven_a_sus_vistas`.

### Capturas sugeridas

1. Catálogo con seis productos y precios MXN.
2. Carrito con dos unidades del mismo producto y total calculado.
3. Checkout con formulario y resumen.
4. Confirmación con cliente, número, productos y total.
5. Carrito vacío después de confirmar.
6. Terminal mostrando `check` y las 16 pruebas aprobadas.

## Referencia y adaptación

[nickjj/docker-django-example](https://github.com/nickjj/docker-django-example)
sirvió como referencia para separar `config/`, las aplicaciones y las opciones de entorno.
Se mantuvo una estructura pequeña para la actividad y ejecución directa en Windows.
Las sesiones en archivos siguen la [documentación oficial de Django](https://docs.djangoproject.com/en/5.2/topics/http/sessions/#using-file-based-sessions).

## Límites y pendientes de entrega

- Catálogo y pedido simulados, sin pagos, correos ni autenticación.
- Se conserva solo el último pedido de la sesión; no hay historial persistente.
- React y Django son demostraciones separadas y no comparten estado.
- Configuración de desarrollo local; no incluye despliegue de producción.
- La protección de reenvío cubre envíos secuenciales con el carrito ya vacío; no se implementan transacciones ni control de pedidos concurrentes.
- Resta incorporar las evidencias al PDF y entregarlo en la plataforma académica.
- No se realizó commit ni push. El futuro commit será `Vistas del e-commerce`, cuando el autor lo solicite.

## Verificación en navegador

Compra completa verificada con Microsoft Edge: dos unidades del mismo producto,
checkout con CSRF, confirmación conservada al recargar y carrito vacío después.
CSS servido con HTTP 200. Catálogo revisado a 375, 768 y 1440 píxeles sin desbordamiento.
Se inspeccionaron visualmente el catálogo de escritorio y el checkout móvil.
Las capturas locales están en `../test-results/django-catalogo-375.png`,
`../test-results/django-catalogo-768.png`, `../test-results/django-catalogo-1440.png`,
`../test-results/django-checkout-mobile.png` y `../test-results/django-confirmacion-mobile.png`.
Esta carpeta está excluida de Git; se pueden usar las capturas en el PDF.
