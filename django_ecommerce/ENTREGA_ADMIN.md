# Registrando modelos en el Django Admin

## Objetivo

Registrar en Django Admin los cinco modelos existentes del e-commerce y comprobar
que el panel puede utilizarlos, conservando las funcionalidades anteriores.

## Proyecto existente

Se reutilizaron `ventas`, `order_manager`, `address`, `billing_profile`, `cart` y
`product`. Order ya estaba definido en `order_manager/models.py` con su relación
OneToOne a Cart, total y fecha automática. No se creó otro Order ni otra aplicación.
Se revisaron settings, URLs, modelos, archivos admin y migraciones antes de modificar.
Las 26 pruebas anteriores pasaron en la revisión inicial.

La base sigue siendo SQLite persistente en `db.sqlite3`, excluida de Git. Las sesiones
siguen en archivos. El frontend React, los modelos y las 26 pruebas anteriores
permanecen intactos. Se conservaron los cambios previos que ya tenía el README.

## Modelos registrados

- Product: columnas id, name, price; búsqueda por nombre.
- Address: id, street, city, state, country, postal_code; búsqueda por calle, ciudad y CP.
- BillingProfile: id, user, address; búsqueda por usuario y calle.
- Cart: id, user; búsqueda por usuario.
- Order: id, cart, total, created_at; búsqueda por usuario del carrito.

Se emplea `@admin.register(Model)` con `ModelAdmin`: es equivalente al registro con
`admin.site.register(Model, ModelAdmin)`. Permite agregar columnas y búsquedas sin
cambiar campos ni relaciones de los modelos. Cada modelo se registra una sola vez.

## Archivos creados

- `django_ecommerce/config/test_admin.py`: ocho pruebas de integración.
- `django_ecommerce/ENTREGA_ADMIN.md`: esta guía para el PDF.

## Archivos modificados

- `django_ecommerce/config/settings.py`.
- `django_ecommerce/config/urls.py`.
- `django_ecommerce/product/admin.py`.
- `django_ecommerce/address/admin.py`.
- `django_ecommerce/billing_profile/admin.py`.
- `django_ecommerce/cart/admin.py`.
- `django_ecommerce/order_manager/admin.py`.
- `README.md`: se añadió una sección sin borrar las anteriores.

La base local ignorada `db.sqlite3` recibió las migraciones internas. No se generaron
archivos nuevos de migración de las aplicaciones académicas.

## Código creado/modificado

Los siguientes bloques contienen el código completo de los cinco registros y de
las URLs principales, listo para incorporarlo al PDF.

### product/admin.py

```python
from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price")
    search_fields = ("name",)
```

### address/admin.py

```python
from django.contrib import admin
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("id", "street", "city", "state", "country", "postal_code")
    search_fields = ("street", "city", "postal_code")
```

### billing_profile/admin.py

```python
from django.contrib import admin
from .models import BillingProfile


@admin.register(BillingProfile)
class BillingProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "address")
    search_fields = ("user__username", "address__street")
```

### cart/admin.py

```python
from django.contrib import admin
from .models import Cart


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user")
    search_fields = ("user__username",)
```

### order_manager/admin.py

```python
from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "total", "created_at")
    search_fields = ("cart__user__username",)
```

### config/urls.py

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("ventas.urls")),
]
```

### config/settings.py: partes relevantes

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "ventas.apps.VentasConfig",
    "order_manager.apps.OrderManagerConfig",
    "address.apps.AddressConfig",
    "billing_profile.apps.BillingProfileConfig",
    "cart.apps.CartConfig",
    "product.apps.ProductConfig",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
```

Se añadieron `django.contrib.admin`, `django.contrib.sessions` y `django.contrib.messages`.
Se conservaron auth, contenttypes, staticfiles y las seis aplicaciones existentes.
AuthenticationMiddleware se ejecuta después de SessionMiddleware; MessageMiddleware
habilita los mensajes del panel. Se añadieron los procesadores de contexto auth y
messages junto al de request. `APP_DIRS` continúa habilitado.

`SESSION_ENGINE` sigue siendo `django.contrib.sessions.backends.file`. Aunque se crea
la tabla interna django_session al migrar, las sesiones configuradas siguen en archivos.

## Migraciones

Comandos ejecutados desde `django_ecommerce/` con el Python del entorno virtual:

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
```

Resultado real de `makemigrations`:

```text
No changes detected
```

Resultado real de `migrate`:

```text
Applying admin.0001_initial... OK
Applying admin.0002_logentry_remove_auto_add... OK
Applying admin.0003_logentry_add_action_flag_choices... OK
Applying sessions.0001_initial... OK
```

No fue necesario cambiar los modelos. Se aplicaron cuatro migraciones internas.
`showmigrations` confirmó las 23 migraciones aplicadas con `[X]`: las 19 anteriores
más las tres de Admin y una de sessions. No quedan migraciones pendientes.

## Validación

```text
python manage.py check
System check identified no issues (0 silenced).

python manage.py makemigrations --check
No changes detected

python manage.py test
Found 34 test(s).
Ran 34 tests
OK
```

Las 26 pruebas existentes se conservaron. Ocho pruebas nuevas en `config/test_admin.py`
verifican el registro con `admin.site.is_registered`, índice del Admin, listados y
formularios de alta de los cinco modelos, redirección del visitante anónimo, rechazo
del usuario sin staff, rechazo de staff sin permiso sobre Product, creación de un
producto mediante POST al Admin y resolución de las seis URLs originales de ventas.

Se verificó HTTP 200 para `/admin/` con un superusuario temporal autenticado mediante
el cliente de pruebas de Django. También se verificó que el POST de alta guarda
el producto y redirige correctamente. Las pruebas se ejecutan en una base temporal
y con sesiones temporales; no crean un administrador en la base local ni guardan
credenciales. Utilizan identificadores generados y `force_login` sin contraseña.

Las pruebas anteriores siguen comprobando Product, Address, BillingProfile, Cart,
Order y el flujo completo de ventas. La ruta `/admin/` se añadió antes de incluir
`ventas.urls` en `/`, conservando todas las rutas anteriores.

## Django Admin

Acceso local: **http://127.0.0.1:8000/admin/**.

En esta revisión no se encontró un superusuario activo y no se creó uno. Para crear
el administrador manualmente desde PowerShell:

```powershell
cd "D:\EBAC\Tercer Proyecto\HDev_Store\django_ecommerce"
.\venv\Scripts\python.exe manage.py createsuperuser
.\venv\Scripts\python.exe manage.py runserver
```

Con el entorno activado, el comando equivalente es:

```powershell
python manage.py createsuperuser
```

Introduce los datos únicamente en la terminal. Si ya creaste un administrador desde
esta revisión, utiliza el existente. No se incluyen usuarios ni contraseñas de acceso
en código ni documentación. Para una instalación nueva instala `requirements.txt`
y ejecuta `migrate` antes de crear el administrador.

Para el PDF, incluir los bloques de código anteriores y las salidas de validación.
Después de crear el administrador puedes agregar una captura del índice del Admin
y de los listados de los cinco modelos, evitando mostrar datos sensibles.

## Repositorio

https://github.com/hugohdev-13/hdev-store-ecommerce

## Commit

El futuro commit será exactamente:

```text
Registrando modelos en el Django Admin
```

No se ejecutaron `git add`, `git commit` ni `git push`. El autor revisará y realizará
esas acciones manualmente.

## Limitaciones

Implementación académica: el Admin se utiliza únicamente para gestionar datos del
proyecto. No incorpora pagos reales ni procesamiento real de pedidos. Los registros
administrados no alimentan todavía el catálogo ni el checkout simulado de ventas.
Se mantiene la configuración de desarrollo local. Falta crear manualmente el
administrador para el acceso humano y preparar y entregar el PDF.
