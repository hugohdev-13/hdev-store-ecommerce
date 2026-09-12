# Django Templates

## Objetivo

Demostrar filtros, ciclos, variables de iteración, herencia e inclusión de fragmentos
reutilizables dentro de ventas, conservando las funcionalidades anteriores.

## Requisitos de la actividad

- Filtros: title, upper, lower, length, truncatechars:45 y floatformat:2.
- Ciclo for con empty para un listado sin productos.
- forloop.counter, forloop.first y forloop.last para numeración e indicadores.
- divisibleby:"3" en ramas if, con mensaje solo en las posiciones 3 y 6.
- Herencia de ventas/base.html mediante extends y sus bloques title y content.
- Include con producto, numero, es_divisible, primero y ultimo explícitos y contexto aislado con only.
- Clases panel, producto, catalogo, precio y etiqueta del CSS existente, sin estilos adicionales.

Los seis productos son demostrativos y se construyen en memoria. Los importes usan
Decimal para preservar los centavos. La vista no consulta ni modifica la base de datos.

## Archivos creados

- `django_ecommerce/ventas/templates/ventas/django_templates.html`.
- `django_ecommerce/ventas/templates/ventas/includes/producto_card.html`.
- `django_ecommerce/ventas/test_django_templates.py`.
- `django_ecommerce/ENTREGA_DJANGO_TEMPLATES.md`.

## Archivos modificados

- `django_ecommerce/ventas/views.py`: nueva vista GET.
- `django_ecommerce/ventas/urls.py`: nueva ruta con namespace ventas.
- `django_ecommerce/ventas/templates/ventas/base.html`: enlace Django Templates.
- `README.md`: sección nueva, conservando contenido y cambios previos.

No se modificaron modelos, migraciones, pruebas anteriores, React ni el CSS.

## Código completo de la vista

```python
from decimal import Decimal
from django.shortcuts import render
from django.views.decorators.http import require_GET

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
```

## Código de la URL

Dentro de urlpatterns de ventas/urls.py, conservando app_name = "ventas":

```python
path("templates-demo/", views.django_templates_demo, name="django_templates_demo"),
```

En la navegación de base.html:

```html
<a href="{% url 'ventas:django_templates_demo' %}">Django Templates</a>
```

## Código completo de django_templates.html

```html
{% extends 'ventas/base.html' %} {% block title %}{{ titulo|title }} | HDev Store{% endblock %} {%
block content %}
<h1>{{ titulo|title }}</h1>
<p class="intro">Demostración académica con productos en memoria, sin guardar datos.</p>
<section class="panel" aria-label="Ejemplos de filtros">
  <p>Mayúsculas: {{ subtitulo|upper }}</p>
  <p>Minúsculas: {{ subtitulo|lower }}</p>
  <p>Total de productos: {{ productos|length }}</p>
</section>
<div class="catalogo">
  {% for producto in productos %} {% if forloop.counter|divisibleby:"3" %} {% include
  'ventas/includes/producto_card.html' with producto=producto numero=forloop.counter
  es_divisible=True primero=forloop.first ultimo=forloop.last only %} {% else %} {% include
  'ventas/includes/producto_card.html' with producto=producto numero=forloop.counter
  es_divisible=False primero=forloop.first ultimo=forloop.last only %} {% endif %} {% empty %}
  <p class="panel">No hay productos de demostración disponibles.</p>
  {% endfor %}
</div>
{% endblock %}
```

## Código completo de includes/producto_card.html

```html
<article class="panel producto" data-posicion="{{ numero }}">
  <p class="etiqueta">Producto {{ numero }} · {{ producto.categoria|title }}</p>
  <h2>{{ producto.nombre|upper }}</h2>
  <p>{{ producto.descripcion|truncatechars:45 }}</p>
  <p class="precio">${{ producto.precio|floatformat:2 }} MXN</p>
  {% if primero %}
  <p>Primer producto del listado</p>
  {% endif %} {% if ultimo %}
  <p>Último producto del listado</p>
  {% endif %} {% if es_divisible %}
  <p>Esta posición es divisible entre 3</p>
  {% endif %}
</article>
```

## Explicación de filtros

Title convierte el título a «Django Templates» y capitaliza categorías. Upper muestra
nombres y subtítulo en mayúsculas; lower muestra el subtítulo en minúsculas. Length
muestra seis productos. Floatformat:2 conserva dos decimales, por ejemplo 24599.90.
Truncatechars:45 limita descripciones a 45 caracteres, incluyendo la elipsis cuando
hace falta. Las descripciones propuestas son cortas; una prueba con 60 caracteres
verifica explícitamente el truncamiento a 44 caracteres más la elipsis.

## Explicación del ciclo for y divisibleby

El for recorre productos. Counter empieza en 1 y numera cada tarjeta. First y last
identifican la primera y última. Divisibleby:"3" resulta verdadero en 3 y 6: esas
ramas pasan es_divisible=True; las demás pasan False. No se usa sintaxis Python en
el template. Empty muestra un mensaje y ninguna tarjeta cuando la lista está vacía.

## Explicación de herencia

Extends reutiliza base.html; los bloques title y content aportan el contenido propio.
La página no duplica html, head, navegación o footer. Reutiliza la cuadrícula responsive
y las tarjetas ya definidas en estilos.css.

## Explicación de include con variables

El fragmento producto_card.html solo contiene una tarjeta article. Recibe variables
explícitas mediante with y only, sin depender del contexto global. El if del fragmento
muestra el mensaje si es_divisible es verdadero. Primero y ultimo también se pasan
explícitamente para no depender de forloop dentro del include.

## Pruebas realizadas

Antes de modificar pasaron las 47 pruebas anteriores. Se añadieron seis pruebas:

1. HTTP 200, contexto con título/subtítulo y seis productos, herencia, include y cero consultas.
2. Numeración de cada tarjeta, divisibilidad únicamente en 3 y 6 e indicadores de primera/última.
3. Resultados de title, upper, lower, title de categoría y precio con dos decimales.
4. Fragmento renderizado por separado con variables explícitas y descripción larga truncada.
5. Lista vacía: mensaje empty, contador cero y ausencia de tarjetas.
6. Resolución de URL, enlace y páginas anteriores: catálogo, carrito, registro, gráfica y JSON.

Las pruebas existentes de Admin, modelos, Forms y checkout continúan intactas.

## Resultados de validación

Ejecutados desde django_ecommerce con el entorno virtual existente:

```text
python manage.py check
System check identified no issues (0 silenced).

python manage.py makemigrations --check
No changes detected

python manage.py test
Found 53 test(s).
Ran 53 tests
OK
```

No se generaron migraciones. La actividad utiliza datos académicos fijos; la lista
vacía se verifica renderizando el template en una prueba, no alterando la BD.

## Ruta de prueba

http://127.0.0.1:8000/templates-demo/

Desde django_ecommerce iniciar con:

```powershell
.\venv\Scripts\python.exe manage.py runserver
```

Abrir la ruta o pulsar Django Templates en la navegación. Para el PDF, incluir los
bloques completos anteriores, resultados y una captura con las seis tarjetas.

## Repositorio

https://github.com/hugohdev-13/hdev-store-ecommerce

## Commit

El commit final deberá llamarse exactamente **Django Templates**.
Codex NO realizó git add, git commit ni git push.

## Limitaciones

Demostración con productos en memoria, independiente del catálogo y pedidos reales.
Falta preparar y entregar el PDF; no se agregan funcionalidades de compra a esta página.
