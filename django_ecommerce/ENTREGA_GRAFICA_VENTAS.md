# Gráfica de Ventas

## Objetivo

Integrar Chart.js y Ajax mediante fetch para mostrar ventas mensuales en una gráfica
de barras dentro del proyecto Django existente, conservando la tienda y el Admin.

## Archivos creados

- `ventas/templates/ventas/sales_chart.html`.
- `ventas/static/ventas/js/sales_chart.js`.
- `ventas/test_sales_chart.py`.
- `ENTREGA_GRAFICA_VENTAS.md` (este documento).

Las rutas anteriores son relativas a `django_ecommerce/`.

## Archivos modificados

- `django_ecommerce/ventas/views.py`: SalesDataView y sales_chart.
- `django_ecommerce/ventas/urls.py`: dos rutas nuevas.
- `django_ecommerce/ventas/templates/ventas/base.html`: enlace de navegación y bloque scripts al final del body.
- `README.md`: sección de esta actividad, conservando el contenido previo.

No se modificaron modelos, migraciones, configuración, React ni pruebas anteriores.

## Datos

El checkout de ventas usa sesiones y no guarda sus compras en Order. Aunque existe
ese modelo académico, no constituye una fuente de ventas reales del checkout.
Se utilizan los importes controlados solicitados para enero a junio: 12000, 18500,
14300, 22100, 19800 y 26500 MXN. Se identifican como demostrativos tanto en la vista
como en la página. No se crean modelos ni una base de datos adicional.

## Vista de datos

```python
from django.http import JsonResponse
from django.views import View

class Sal
```

## Vista de la gráfica

```python
from django.shortcuts import render
from django.views.decorators.http import require_GET


@require_GET
def sales_chart(request):
    return render(request, "ventas/sales_chart.html")
```

## URLs

Se conservaron las seis rutas anteriores y el namespace ventas. Código agregado:

```python
path("ventas/grafica/", views.sales_chart, name="sales_chart"),
path("ventas/datos/", views.SalesDataView.as_view(), name="sales_data"),
```

## Plantilla HTML

```html
{% extends 'ventas/base.html' %} {% load static %} {% block title %}Gráfica de Ventas | HDev Store{%
endblock %} {% block content %}
<h1>Gráfica de Ventas</h1>
<p class="intro">Ventas mensuales de enero a junio, expresadas en MXN.</p>
<p>Datos de demostración para la actividad académica. No representan compras reales.</p>
<section class="panel" aria-label="Ventas mensuales de demostración">
  <p id="salesStatus" role="status" aria-live="polite">Cargando datos de ventas…</p>
  <div style="position: relative; height: 360px; width: 100%;">
    <canvas
      id="salesChart"
      data-url="{% url 'ventas:sales_data' %}"
      role="img"
      aria-label="Gráfica de barras de ventas mensuales en MXN"
      aria-describedby="salesStatus"
    ></canvas>
  </div>
  <noscript>Activa JavaScript para consultar la gráfica de ventas.</noscript>
</section>
{% endblock %} {% block scripts %}
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{% static 'ventas/js/sales_chart.js' %}"></script>
{% endblock %}
```

## JavaScript

```javascript
(async () => {
  const canvas = document.getElementById('salesChart');
  const status = document.getElementById('salesStatus');
  if (!canvas || !status) return;

  try {
    if (typeof Chart === 'undefined') {
      throw new Error('No fue posible cargar Chart.js. Revisa tu conexión y recarga la página.');
    }
    const response = await fetch(canvas.dataset.url);
    if (!response.ok) throw new Error('No fue posible obtener los datos de ventas.');
    const data = await response.json();
    if (
      !Array.isArray(data.labels) ||
      !Array.isArray(data.sales) ||
      data.labels.length === 0 ||
      data.labels.length !== data.sales.length ||
      !data.labels.every((label) => typeof label === 'string') ||
      !data.sales.every((value) => Number.isFinite(value) && value >= 0)
    ) {
      throw new Error('Los datos de ventas tienen un formato inválido.');
    }
    const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{ label: 'Ventas (MXN)', data: data.sales, backgroundColor: '#2858cf' }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: {
          tooltip: { callbacks: { label: (context) => money.format(context.parsed.y) } },
        },
      },
    });
    status.textContent = data.labels
      .map((label, index) => `${label}: ${money.format(data.sales[index])} MXN`)
      .join(' · ');
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'No se pudo cargar la gráfica.';
    status.setAttribute('role', 'alert');
  }
})();
```

## Chart.js

Se carga desde `https://cdn.jsdelivr.net/npm/chart.js`, como muestra la
[documentación oficial](https://www.chartjs.org/docs/latest/getting-started/).
Después se carga el JavaScript propio mediante static, al final del body mediante
el nuevo bloque scripts de base.html. El canvas tiene un contenedor de 360 píxeles
de alto; responsive y maintainAspectRatio permiten adaptarlo al ancho disponible.

## Ajax

fetch obtiene por GET la URL generada por Django en el atributo data-url del canvas.
No exige cabeceras especiales. Comprueba response.ok, convierte la respuesta a JSON,
valida los dos arreglos y construye la gráfica. Ante un error HTTP, datos inválidos
o fallo del CDN, muestra un mensaje visible. Incluye un resumen textual accesible
de los importes y formato monetario es-MX para los tooltips.

## Validación

Antes del cambio pasaron las 34 pruebas existentes. Resultados finales:

```text
python manage.py check
System check identified no issues (0 silenced).

python manage.py makemigrations --check
No changes detected

python manage.py test
Found 38 test(s).
Ran 38 tests
OK
```

Las cuatro pruebas nuevas comprueban página HTTP 200, template, canvas y scripts;
JSON HTTP 200 y Content-Type application/json; valores, longitudes y ausencia de
consultas; rechazo de POST, PUT, PATCH y DELETE con 405; resolución de rutas y enlace
desde el catálogo. La vista basada en clase conserva el comportamiento estándar
HEAD/OPTIONS de Django. No se exige una cabecera Ajax. Las 34 pruebas anteriores
siguen comprobando ventas, modelos, Admin y sus rutas.

## Rutas

- http://127.0.0.1:8000/ventas/grafica/
- http://127.0.0.1:8000/ventas/datos/

Desde django_ecommerce, ejecutar el servidor con:

```powershell
.\venv\Scripts\python.exe manage.py runserver
```

## Repositorio

https://github.com/hugohdev-13/hdev-store-ecommerce

## Commit

El futuro commit será exactamente **Gráfica de Ventas**.
No se ejecutaron git add, git commit ni git push.

## Limitaciones

Gráfica académica con datos demostrativos fijos. No agrega ventas reales, pagos ni
persistencia. El navegador necesita JavaScript y acceso al CDN. La URL del CDN no
fija una versión y puede cambiar en el futuro. Falta incorporar este código y las
evidencias al PDF y entregarlo en la plataforma académica.

## Verificación en navegador

Microsoft Edge cargó Chart.js desde el CDN y dibujó las seis barras con los importes
esperados. Se verificaron anchos de 375 y 1440 píxeles sin desbordamiento horizontal,
y el mensaje visible ante una respuesta HTTP 500 del endpoint. También se comprobó
el mensaje de error cuando el entorno restringido bloqueó inicialmente el CDN.
La ejecución posterior con acceso de red autorizado pasó correctamente.
Capturas locales, excluidas de Git: `test-results/grafica-ventas-375.png` y
`test-results/grafica-ventas-1440.png`, relativas a la raíz del repositorio.
