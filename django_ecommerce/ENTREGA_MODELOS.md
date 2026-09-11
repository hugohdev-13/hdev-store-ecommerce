# Modelos del e-commerce

## Objetivo

Ampliar el proyecto Django existente con las aplicaciones `order_manager`, `address`,
`billing_profile`, `cart` y `product` y sus modelos académicos. La implementación
conserva la aplicación `ventas` y el frontend React.

## Revisión inicial

Antes de modificar archivos se comprobó que existían `config/` y `ventas/`, con vistas,
URLs, formularios, templates, CSS y pruebas. Django instalado: **5.2.17**, con Python
**3.12.10**. `ventas` superó sus 16 pruebas antes de los cambios. Git estaba limpio.
La base inicial era SQLite en memoria y las sesiones se guardaban en archivos.

Para conservar los nuevos modelos se cambió `DATABASES["default"]["NAME"]` a
`BASE_DIR / "db.sqlite3"`. La base local permanece excluida de Git. Se registraron
`django.contrib.auth` y `django.contrib.contenttypes` para poder usar `auth.User`,
además de las cinco aplicaciones nuevas. Se mantuvo `ventas.apps.VentasConfig`.

## Aplicaciones creadas

- `order_manager`: gestión del modelo Order.
- `address`: direcciones mediante Address.
- `billing_profile`: perfiles de facturación mediante BillingProfile.
- `cart`: carritos mediante Cart.
- `product`: productos mediante Product.

Se utilizó el comando de Django `python -m django startapp <aplicación>`, equivalente
al comando administrativo `startapp` solicitado. No se duplicaron aplicaciones.

## Archivos creados

En cada una de las cinco aplicaciones se crearon exactamente estos ocho archivos:

```text
<aplicación>/
  __init__.py
  admin.py
  apps.py
  models.py
  tests.py
  views.py
  migrations/
    __init__.py
    0001_initial.py
```

Esto representa 40 archivos de aplicaciones y migraciones, más este documento
`django_ecommerce/ENTREGA_MODELOS.md`: **41 archivos nuevos para el repositorio**.
`admin.py` y `views.py` son archivos de estructura, sin funcionalidades nuevas.
También se creó localmente `django_ecommerce/db.sqlite3`, excluido de Git, y se
regeneraron cachés Python ignoradas.

## Archivos modificados

- `django_ecommerce/config/settings.py`: aplicaciones y SQLite persistente.
- `README.md`: nueva sección «Modelos del e-commerce — Django».

No se modificaron `ventas`, las dependencias, las rutas ni el frontend React.
La guía `ENTREGA.md` anterior se conserva como evidencia histórica de la primera actividad.

## Modelos creados

| Modelo         | Campos explícitos                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Product        | name: CharField(100); description: TextField; price: DecimalField(10, 2)                             |
| Address        | street: CharField(100); city, state, country: CharField(50); postal_code: CharField(10)              |
| BillingProfile | user: ForeignKey a auth.User; address: ForeignKey a Address                                          |
| Cart           | user: ForeignKey a auth.User; products: ManyToManyField a Product                                    |
| Order          | cart: OneToOneField a Cart; total: DecimalField(10, 2); created_at: DateTimeField(auto_now_add=True) |

Todos incluyen `__str__`. Django agrega automáticamente una clave primaria `id`
de tipo BigAutoField. No se añadieron campos de negocio adicionales.

## Relaciones

| Relación académica             | Significado                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| User 1 --- N BillingProfile    | Un usuario puede tener varios perfiles; cada perfil pertenece a un usuario.                      |
| Address 1 --- N BillingProfile | Una dirección puede asociarse a varios perfiles; cada perfil tiene una dirección.                |
| User 1 --- N Cart              | Un usuario puede tener varios carritos; cada carrito pertenece a un usuario.                     |
| Cart N --- N Product           | Un carrito puede contener varios productos y un producto puede estar en varios carritos.         |
| Cart 1 --- 1 Order             | Cada pedido tiene un carrito único; un carrito puede existir sin pedido y tener como máximo uno. |

Django crea automáticamente la tabla intermedia `cart_cart_products` para ManyToMany.
No hay cantidades en esa relación. Todas las ForeignKey y la OneToOne usan CASCADE:
al borrar el objeto referenciado se eliminan sus registros dependientes. Eliminar
un carrito no elimina los productos de su catálogo.

## Código principal

Código completo de los cinco archivos `models.py`, listo para incluir en el PDF.
`order_manager/models.py` importa Cart, pero no Product, porque Order no utiliza
Product directamente. Así se evita el import sin usar del ejemplo académico.

### product/models.py

```python
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name
```

### address/models.py

```python
from django.db import models


class Address(models.Model):
    street = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.street}, {self.city}"
```

### billing_profile/models.py

```python
from django.db import models
from address.models import Address


class BillingProfile(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    address = models.ForeignKey(Address, on_delete=models.CASCADE)

    def __str__(self):
        return f"Perfil de facturación de {self.user} — {self.address}"
```

### cart/models.py

```python
from django.db import models
from product.models import Product


class Cart(models.Model):
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    products = models.ManyToManyField(Product)

    def __str__(self):
        return f"Carrito {self.pk} de {self.user}"
```

### order_manager/models.py

```python
from django.db import models
from cart.models import Cart


class Order(models.Model):
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido {self.pk} — carrito {self.cart_id}"
```

## Migraciones

Comandos ejecutados con el Python del entorno virtual del proyecto:

```powershell
python manage.py makemigrations
python manage.py migrate
```

Resultado real de `makemigrations`:

```text
Migrations for 'address': address/migrations/0001_initial.py — Create model Address
Migrations for 'billing_profile': billing_profile/migrations/0001_initial.py — Create model BillingProfile
Migrations for 'product': product/migrations/0001_initial.py — Create model Product
Migrations for 'cart': cart/migrations/0001_initial.py — Create model Cart
Migrations for 'order_manager': order_manager/migrations/0001_initial.py — Create model Order
```

Resultado real de `migrate`: se aplicaron **19 migraciones**, cinco propias, doce de
`auth` y dos de `contenttypes`, todas con `OK`. Extracto de las migraciones propias:

```text
Applying address.0001_initial... OK
Applying billing_profile.0001_initial... OK
Applying product.0001_initial... OK
Applying cart.0001_initial... OK
Applying order_manager.0001_initial... OK
```

`showmigrations` confirmó `[X]` en las 19 migraciones. Una conexión posterior a la
base persistente verificó las tablas `address_address`, `billing_profile_billingprofile`,
`cart_cart`, `cart_cart_products`, `order_manager_order`, `product_product` y `auth_user`.
Las migraciones generadas declaran las dependencias de las relaciones, incluida
`migrations.swappable_dependency(settings.AUTH_USER_MODEL)` para User.

Durante la ejecución, el entorno restringido denegó inicialmente la escritura de
SQLite. Se volvió a ejecutar `migrate` con permisos autorizados y finalizó correctamente;
no fue necesario cambiar el esquema ni dejar migraciones pendientes.

## Pruebas

Se ejecutaron **26 pruebas, todas aprobadas**: 10 nuevas de modelos y las 16 existentes
de `ventas`. Se usa `django.test.TestCase` y `django.contrib.auth.models.User`.

| Aplicación      | Pruebas | Cobertura                                                                        |
| --------------- | ------- | -------------------------------------------------------------------------------- |
| product         | 1       | Crear y recuperar nombre, descripción, precio decimal y representación           |
| address         | 1       | Crear y recuperar todos los campos, CP con cero inicial y representación         |
| billing_profile | 3       | Relaciones con User y Address, cardinalidad, representación y CASCADE            |
| cart            | 2       | User, varios productos y carritos, ManyToMany, eliminación y CASCADE             |
| order_manager   | 3       | Cart, total exacto, fecha automática estable, representación, unicidad y CASCADE |
| ventas          | 16      | Catálogo, carrito, checkout, confirmación, sesiones, validaciones, URLs y CSRF   |

Las pruebas guardan y recuperan registros reales del ORM en una base temporal;
no dejan usuarios ni productos de prueba en `db.sqlite3`. La prueba de unicidad
comprueba el error de integridad de SQLite con un segundo pedido del mismo carrito.

## Validación

Resultados reales con Python 3.12.10 y Django 5.2.17:

```text
python manage.py check
System check identified no issues (0 silenced).

python manage.py makemigrations --check
No changes detected

python manage.py test
Found 26 test(s).
Ran 26 tests
OK
```

La aplicación `ventas` sigue funcionando: sus 16 pruebas pasan tras el cambio de
base de datos y comprueban incluso el checkout completo y la conservación del pedido
al vaciar el carrito. Sus archivos permanecen intactos.

## Ejecución en Windows

Desde PowerShell con el entorno existente:

```powershell
cd "D:\EBAC\Tercer Proyecto\HDev_Store\django_ecommerce"
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py runserver
```

Con el entorno activado, usar `python` en lugar de la ruta al ejecutable.
Para una instalación nueva, primero ejecutar `python -m venv venv` e instalar
`requirements.txt` con el Python del entorno. Abrir http://127.0.0.1:8000/.

## Repositorio

https://github.com/hugohdev-13/hdev-store-ecommerce

Se trabajó sobre el repositorio existente, sin crear otro. No se realizó commit ni push.
El futuro commit será exactamente **Modelos del e-commerce**, cuando el autor lo solicite.

## Limitaciones

- Los modelos son académicos y sus relaciones sirven como base para futuras funcionalidades.
- No hay pagos reales ni procesamiento real de órdenes.
- Los nuevos modelos no se conectan todavía con las vistas de `ventas` ni con React.
- El catálogo y checkout de `ventas` siguen siendo simulados y usan sesiones en archivos.
- Cart no registra cantidades: ManyToMany relaciona productos sin duplicarlos.
- Order.total se proporciona explícitamente; no se calcula automáticamente.
- No se agregaron inventario, administración web ni restricciones de negocio adicionales.
- Falta incorporar esta documentación y las evidencias al PDF, entregarlo y solicitar el commit si corresponde.
