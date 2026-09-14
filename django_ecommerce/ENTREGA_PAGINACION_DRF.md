# Paginación en Django Rest Framework

## Objetivo

Exponer los productos en `/api/productos/` mediante una API paginada.

## Tipo de paginación elegido

`PageNumberPagination` permite navegar con números de página y delega en DRF el cálculo de páginas, límites y enlaces.

## Clase de paginación

```python
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class HDevPageNumberPagination(PageNumberPagination):
    page_size = 4
    page_query_param = "pagina"
    page_size_query_param = "tamano"
    max_page_size = 10

    def get_paginated_response(self, data):
        return Response({
            "total": self.page.paginator.count,
            "pagina_actual": self.page.number,
            "total_paginas": self.page.paginator.num_pages,
            "siguiente": self.get_next_link(),
            "anterior": self.get_previous_link(),
            "resultados": data,
        })
```

## Configuración

`page_size = 4` establece el tamaño predeterminado. `page_query_param = "pagina"` selecciona la página. `page_size_query_param = "tamano"` cambia su tamaño. `max_page_size = 10` limita el tamaño solicitado.

## Serializer

Usa únicamente los campos reales de `Product`.

```python
from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ("id", "name", "description", "price")
```

## Vista API

```python
from rest_framework.generics import ListAPIView
from .models import Product
from .pagination import HDevPageNumberPagination
from .serializers import ProductSerializer


class ProductListAPIView(ListAPIView):
    queryset = Product.objects.all().order_by("pk")
    serializer_class = ProductSerializer
    pagination_class = HDevPageNumberPagination
```

La vista solo permite GET y ordena por clave primaria para mantener páginas estables.

## URL

En `config/urls.py`:

```python
path("api/productos/", ProductListAPIView.as_view(), name="api_productos"),
```

## Ejemplos de uso

- `/api/productos/`
- `/api/productos/?pagina=1`
- `/api/productos/?pagina=2`
- `/api/productos/?pagina=1&tamano=2`

## Ejemplo de respuesta JSON

Ejemplo ilustrativo del formato, no de los datos locales:

```json
{
  "total": 1,
  "pagina_actual": 1,
  "total_paginas": 1,
  "siguiente": null,
  "anterior": null,
  "resultados": [{"id": 1, "name": "Producto ejemplo", "description": "Descripción ejemplo", "price": "10.00"}]
}
```

## Pruebas realizadas

`product/test_pagination.py` comprueba HTTP 200; tamaño predeterminado y máximo de cuatro; campos de respuesta; anterior nulo y siguiente enlazado en la primera página; elementos de segunda página y orden estable; tamaño personalizado de dos; límite de diez ante `tamano=100`; 404 estándar de DRF para página inexistente; y rechazo de POST con 405. Los datos existen solo en la base de pruebas.

## Resultados de validación

Ejecutado desde `django_ecommerce/` con `./venv/Scripts/python.exe`:

- `manage.py check`: sin problemas (0 silenciados).
- `manage.py makemigrations --check`: `No changes detected`.
- `manage.py test`: 59 pruebas aprobadas (53 anteriores y 6 nuevas).

## Repositorio

https://github.com/hugohdev-13/hdev-store-ecommerce

## Commit

El commit final deberá llamarse exactamente **Paginación en Django Rest Framework**. Codex NO realizó `git add`, `git commit` ni `git push`.

## Limitaciones

DRF no estaba instalado ni configurado. Se instaló `djangorestframework==3.18.1` únicamente en el entorno virtual existente, se registró en `requirements.txt` y se agregó `rest_framework` a `INSTALLED_APPS`. El JSON anterior es ilustrativo; las pruebas verifican la respuesta con datos aislados.
