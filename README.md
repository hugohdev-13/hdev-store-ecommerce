# HDev Store

Frontend de e-commerce desarrollado como proyecto del programa Desarrollo Full Stack Python. Una tienda de tecnología para programación y productividad, con identidad visual propia y ocho productos ficticios.

## Tecnologías

- React 19 y TypeScript con comprobación estricta.
- Vite para desarrollo y build.
- Styled-Components para los estilos y el tema.
- Redux Toolkit y React Redux para carrito, usuario y orden.
- React Router para navegación.
- Vitest y React Testing Library para pruebas unitarias e integración.
- Playwright para pruebas de navegador con Microsoft Edge.
- Lucide React para iconos y Prettier para formato.

Las versiones exactas están en `package-lock.json`.

## Funcionalidades

- Login y registro simulados con validaciones y mensajes por campo.
- Catálogo de ocho productos con imágenes SVG locales, búsqueda, categorías y orden por precio.
- Precios con `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`.
- Carrito en Redux: agregar, aumentar, disminuir, eliminar y vaciar; cantidades limitadas al stock.
- Checkout con dirección, validación de pago ficticio y resumen del pedido.
- Confirmación con número de orden, fecha, productos, cantidades, precios, total y dirección.
- Menú móvil, formularios accesibles, indicadores del carrito y estados vacíos.
- Diseño responsive comprobado a 375, 768, 1024 y 1440 px.
- Ruta 404 y enlaces para volver a la tienda.

## Instalación

Requisito: Node.js 22.12+ o una versión LTS posterior compatible con Vite. El proyecto se verificó con Node.js 24.21.0.

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente http://localhost:5173.

En Windows, si PowerShell bloquea `npm.ps1`, usa `npm.cmd install` y `npm.cmd run dev`. No necesitas modificar la política de ejecución.

Para una instalación reproducible cuando ya existe el lockfile:

```bash
npm ci
```

## Uso de la demostración

1. Explora el catálogo y agrega productos al carrito.
2. Opcionalmente, crea un perfil o inicia sesión con un correo válido y cualquier contraseña ficticia de al menos ocho caracteres.
3. En el carrito, cambia cantidades y pulsa **Continuar compra**.
4. Completa una dirección ficticia en México (CP de cinco dígitos y teléfono de diez).
5. Usa un titular ficticio, tarjeta `4242 4242 4242 4242`, vencimiento `12/35` y CVV `123`.
6. Pulsa **Guardar método de pago** y luego **Confirmar compra**.

El login no comprueba credenciales reales. El registro guarda únicamente nombre y correo en memoria; no guarda contraseñas. No se requieren cuentas para comprar.

El pago se valida solo por formato y vencimiento. Cambiar un campo de pago invalida su confirmación previa. No hay backend, base de datos ni servicios de cobro. Los datos de tarjeta y CVV nunca se incluyen en Redux, almacenamiento local, órdenes o peticiones.

Todo el estado es temporal: recargar la página reinicia usuario, registro, carrito y orden. La confirmación sin orden muestra un estado vacío.

## Rutas

| Ruta                  | Vista        |
| --------------------- | ------------ |
| `/`                   | Inicio       |
| `/products`           | Catálogo     |
| `/login`              | Login        |
| `/register`           | Registro     |
| `/cart`               | Carrito      |
| `/checkout`           | Checkout     |
| `/order-confirmation` | Confirmación |
| Cualquier otra        | Página 404   |

La búsqueda y categoría se conservan en los parámetros de la URL del catálogo.

## Estructura

```text
public/
  favicon.svg
  images/                # Ocho productos y un setup, ilustraciones locales
src/
  components/
    common/              # Botones, paneles, inputs y formularios
    ...                  # Header, Footer, Layout, tarjetas y resumen
  data/products.ts
  pages/                 # Una vista por ruta; Auth compartido
  store/                 # Store, hooks tipados y tres slices
  styles/                # Tema, tipos y reset global mínimo
  tests/                 # Componentes, integración, Redux y validaciones
  types/
  utils/
  App.tsx                # Routing
  main.tsx               # Providers
e2e/                     # Navegador, responsive y compra completa
```

Las reglas de negocio del carrito viven en `cartSlice.ts`. Los componentes despachan acciones usando `useAppDispatch` y leen el estado con `useAppSelector`. El checkout construye una copia de la orden antes de vaciar el carrito.

## Pruebas

```bash
npm test
npm run test:watch
npm run typecheck
npm run test:e2e
```

- 19 pruebas unitarias e integración: ProductCard, Cart, Login, Register, Checkout, acciones Redux y validaciones.
- 6 pruebas E2E: rutas y ausencia de desbordamiento horizontal a cuatro anchos, compra completa en celular, filtros, orden y menú móvil.
- Las pruebas E2E revisan errores de consola, imágenes cargadas y generan capturas en `test-results/`.
- Playwright usa Microsoft Edge instalado y arranca Vite automáticamente. Si falta Edge: `npx playwright install msedge`. Para otro navegador ajusta `channel` en `playwright.config.ts`.
- Los tests crean un store nuevo por caso para evitar contaminación de estado.

## Build y formato

```bash
npm run build
npm run preview
npm run format:check
npm run format
```

El build ejecuta TypeScript (incluida revisión de variables e imports sin utilizar) y genera `dist/`. El código principal usa styled-components; no hay Bootstrap ni archivos CSS tradicionales.

## Entrega en GitHub

El proyecto incluye `.gitignore` y lockfile. No subas `node_modules/`, `dist/` ni resultados de pruebas. No se realizaron commits ni publicación automática.

Para desplegar el build, utiliza un hosting estático con fallback de rutas a `index.html`, necesario por BrowserRouter. Subir el repositorio a GitHub no publica automáticamente el sitio. GitHub Pages necesita configuración adicional de base y manejo de rutas si se decide utilizarlo.

Las ilustraciones SVG se crearon para este proyecto y se distribuyen dentro del repositorio; no requieren un servicio de imágenes externo.

## Autor

Héctor Hugo Hernández

## Vistas del e-commerce — Django

Actividad académica **Vistas del e-commerce**: configurar vistas funcionales, URLs,
plantillas y un carrito con sesiones en Django. La implementación está separada en
`django_ecommerce/`; React continúa ejecutándose con Vite y conserva su propio estado.
Las secciones anteriores describen el frontend React.

### Organización

```text
django_ecommerce/
  manage.py
  requirements.txt
  ENTREGA.md                  # Guía y código principal para el PDF
  config/
    __init__.py
    settings.py               # App ventas, middleware, sesiones y templates
    urls.py                   # include("ventas.urls") en la raíz
    asgi.py
    wsgi.py
  ventas/
    __init__.py
    apps.py
    forms.py                  # Validación de los cinco campos del checkout
    views.py                  # Catálogo, carrito, pedido y confirmación
    urls.py                   # Seis rutas con namespace ventas
    tests.py                  # TestCase y reverse, 16 pruebas
    templates/ventas/
      base.html
      ventas.html
      carrito.html
      checkout.html
      confirmacion.html
    static/ventas/estilos.css
```

Se tomó como referencia [nickjj/docker-django-example](https://github.com/nickjj/docker-django-example),
en particular la separación de configuración en `config/`, aplicaciones Django
independientes y opciones de configuración mediante variables de entorno.
Esta actividad adapta esas ideas a Python en Windows, sin requerir Docker,
PostgreSQL, Redis ni Celery. No se copió ni reemplazó el frontend existente.

### Vistas, templates y sesiones

`ventas` se registra mediante `ventas.apps.VentasConfig` en `INSTALLED_APPS`.
`config/urls.py` incluye `ventas.urls` en `/`, con `app_name = "ventas"`.
Los templates usan herencia, `{% for %}`, `{{ variable }}`, `{% url %}` y CSRF.

- `lista_productos`: muestra seis diccionarios de productos y precios en MXN mediante `render()`.
- `agregar_carrito`: recibe el ID, incrementa la cantidad en `request.session["carrito"]` y redirige.
- `ver_carrito`: calcula cantidades, precios, subtotales y total con `Decimal` y renderiza el carrito.
- `eliminar_carrito`: elimina la línea completa de la sesión y redirige. La acción aparece como botón de enlace dentro de un formulario POST con CSRF.
- `procesar_pedido`: GET muestra el formulario; POST valida nombre, correo, dirección, ciudad y CP mexicano de cinco dígitos mediante `PedidoForm`.
- `confirmacion_pedido`: renderiza número simulado, cliente, productos, cantidades e importes desde `request.session["pedido"]`.

El carrito guarda únicamente IDs como cadenas y cantidades. Los precios se obtienen
del catálogo del servidor. Antes de vaciar el carrito se guarda una copia independiente
del pedido; sus importes se convierten a cadenas para la serialización JSON de sesiones.
La confirmación permanece al recargar y al agregar productos a un nuevo carrito.
Se conserva únicamente el último pedido de cada sesión.

Se utiliza el [backend de sesiones en archivos de Django](https://docs.djangoproject.com/en/5.2/topics/http/sessions/#using-file-based-sessions):
los datos permanecen en `django_ecommerce/.sessions/`, excluido de Git, y el navegador
recibe una cookie de identificación. La sesión expira tras una hora desde su última
modificación. No hay modelos ni persistencia de negocio en una base de datos.
SQLite en memoria se configura únicamente para compatibilidad con comandos administrativos
y `TestCase`. `migrate` es opcional y responde que no hay migraciones.

### Ejecución en Windows

Requiere Python 3.10 o posterior compatible con Django 5.2; verificado con Python 3.12.10
y Django 5.2.17. Desde PowerShell:

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

Si PowerShell bloquea la activación, usa el ejecutable del entorno directamente,
sin cambiar la política de ejecución:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py runserver
```

En CMD, la activación equivalente es `venv\Scripts\activate.bat`.
Abre **http://127.0.0.1:8000/**. React puede seguir funcionando en otra terminal
con `npm.cmd run dev` desde la raíz, normalmente en el puerto 5173.

### URLs de Django

| Método    | URL                                    | Nombre dentro de `ventas` |
| --------- | -------------------------------------- | ------------------------- |
| GET       | `/`                                    | `lista_productos`         |
| GET       | `/carrito/`                            | `ver_carrito`             |
| POST      | `/carrito/agregar/<int:producto_id>/`  | `agregar_carrito`         |
| POST      | `/carrito/eliminar/<int:producto_id>/` | `eliminar_carrito`        |
| GET, POST | `/checkout/`                           | `procesar_pedido`         |
| GET       | `/confirmacion/`                       | `confirmacion_pedido`     |

Agregar y eliminar se ejecutan con los botones de la tienda, no escribiendo esas URLs
en la barra del navegador (GET devuelve 405). Un ID inexistente devuelve 404.
El checkout vacío redirige al carrito; la confirmación sin pedido redirige al catálogo.
Los envíos inválidos muestran errores y conservan el carrito.

### Validación y alcance

`python manage.py check`: sin problemas. `python manage.py test`: 16 pruebas aprobadas.
Se comprueban las seis URLs, los cuatro templates de pantalla, totales, cantidades,
eliminación, validaciones, CSRF, sesiones separadas y conservación del pedido al vaciar
el carrito. Las pruebas usan archivos temporales y verifican que comprar y agregar no
realicen consultas a la base de datos. React: 19 pruebas aprobadas y build correcto.

Demostración local: productos, número de pedido y compra son simulados; no hay cobros,
autenticación ni envío de correos. No se comparte el carrito con React. La configuración
incluye `DEBUG` local y una clave de desarrollo; no constituye configuración de producción.
La guía [django_ecommerce/ENTREGA.md](django_ecommerce/ENTREGA.md) indica el código y
las evidencias para el PDF. El futuro commit solicitado se llamará **Vistas del e-commerce**;
no se creó commit ni se ejecutó push.

## Modelos del e-commerce — Django

La actividad **Modelos del e-commerce** amplía el proyecto Django existente con cinco
aplicaciones y sus modelos. `ventas` mantiene sus vistas, templates, formularios,
URLs y carrito por sesión; el frontend React permanece independiente.

### Aplicaciones, modelos y relaciones

| Aplicación        | Modelo           | Campos y relaciones                               |
| ----------------- | ---------------- | ------------------------------------------------- |
| `product`         | `Product`        | Nombre, descripción y precio decimal              |
| `address`         | `Address`        | Calle, ciudad, estado, país y código postal       |
| `billing_profile` | `BillingProfile` | ForeignKey a User y Address                       |
| `cart`            | `Cart`           | ForeignKey a User y ManyToMany a Product          |
| `order_manager`   | `Order`          | OneToOne a Cart, total decimal y fecha automática |

Relaciones: User 1 → N BillingProfile; Address 1 → N BillingProfile;
User 1 → N Cart; Cart N ↔ N Product; Cart 1 ↔ 1 Order.
Un carrito puede existir sin pedido; cada pedido exige un carrito y no puede haber
dos pedidos del mismo carrito. Las claves foráneas usan `on_delete=models.CASCADE`.
Los modelos incluyen `__str__` y únicamente los campos solicitados, más la clave
primaria automática de Django.

Se registraron las cinco aplicaciones junto con `ventas`, `django.contrib.auth` y
`django.contrib.contenttypes`. Estas dos aplicaciones de Django proporcionan el
modelo User y sus dependencias; no se añadió una interfaz de autenticación.

**Actualización respecto a la actividad de vistas:** ahora la base de datos es
SQLite persistente en `django_ecommerce/db.sqlite3`, excluida de Git. La descripción
anterior de SQLite en memoria y migraciones opcionales corresponde a la primera
actividad. Para esta actividad sí se debe ejecutar `migrate`. Los datos del carrito
y pedido simulado de `ventas` continúan en sesiones en archivos; todavía no utilizan
los nuevos modelos.

### Migraciones y ejecución

Desde PowerShell, usando el entorno ya existente:

```powershell
cd "D:\EBAC\Tercer Proyecto\HDev_Store\django_ecommerce"
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py runserver
```

Para una instalación nueva, crear el entorno e instalar `requirements.txt` como se
explica en la sección anterior. Con el entorno activado se puede usar `python`
en lugar de `.\venv\Scripts\python.exe`. La tienda sigue en http://127.0.0.1:8000/.

Se generó `migrations/0001_initial.py` en cada nueva aplicación mediante
`python manage.py makemigrations`. Se aplicaron las cinco migraciones propias y
las 14 migraciones de `auth` y `contenttypes`: 19 en total, todas con resultado `OK`.
Se verificaron las tablas de los cinco modelos y la tabla intermedia `cart_cart_products`.

### Pruebas y entrega

- `python manage.py check`: `System check identified no issues (0 silenced).`
- `python manage.py makemigrations --check`: `No changes detected`.
- `python manage.py test`: **26 pruebas aprobadas**, 10 nuevas y las 16 de `ventas`.
- Las nuevas pruebas usan `TestCase` y `User`, consultan registros guardados y revisan
  decimales, direcciones, relaciones, fecha automática, unicidad y eliminación en cascada.
- Las pruebas emplean una base temporal y no guardan datos ficticios en la base local.

El código completo de los cinco modelos, relaciones, inventario y resultados reales
se encuentra en [ENTREGA_MODELOS.md](django_ecommerce/ENTREGA_MODELOS.md), preparado
para incorporarlo al PDF. La guía anterior `django_ecommerce/ENTREGA.md` conserva
la evidencia histórica de la actividad de vistas.

Los modelos son académicos: no hay pagos ni procesamiento real de órdenes.
`Cart.products` no registra cantidades y `Order.total` se asigna explícitamente;
no se añadieron campos ni reglas adicionales al ejercicio. Las relaciones sirven
como base para futuras funcionalidades.

No se creó un repositorio ni se realizó commit o push en esta actividad.
El futuro commit solicitado será exactamente **Modelos del e-commerce**.

## Registrando modelos en el Django Admin

Se registraron los modelos existentes **Product, Address, BillingProfile, Cart y Order**
con `@admin.register`, equivalente a `admin.site.register`, y clases `ModelAdmin`
sencillas con columnas descriptivas y búsquedas. Order continúa en `order_manager`.
No se cambiaron los modelos ni el flujo de compra de `ventas`.

El panel está disponible en **http://127.0.0.1:8000/admin/**. Para usarlo, desde
PowerShell y dentro del proyecto Django:

```powershell
cd "D:\EBAC\Tercer Proyecto\HDev_Store\django_ecommerce"
.\venv\Scripts\python.exe manage.py makemigrations
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py createsuperuser
.\venv\Scripts\python.exe manage.py runserver
```

Ejecuta `createsuperuser` únicamente si necesitas crear el administrador local.
En esta revisión no se encontró un superusuario activo y no se creó ninguno.
Introduce sus datos de forma interactiva; no los guardes en el repositorio.
Con el entorno activado puedes usar `python` en lugar de la ruta al ejecutable.

Se habilitaron las aplicaciones Admin, sessions y messages, el middleware de
Autenticación y mensajes y sus procesadores de contexto. Las sesiones siguen en
archivos: registrar `django.contrib.sessions` no cambia `SESSION_ENGINE`.
El Admin gestiona los datos de SQLite; el catálogo y checkout de `ventas` continúan
usando los datos simulados de las actividades anteriores.

Validación desde `django_ecommerce/`:

```powershell
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py showmigrations
```

`check` no detectó problemas y `makemigrations` y `makemigrations --check` respondieron
`No changes detected`. Se aplicaron tres migraciones internas de Admin y una de
sessions; las 23 migraciones del proyecto aparecen aplicadas. Pasaron **34 pruebas**:
las 26 anteriores y ocho nuevas de integración del Admin, permisos, formularios,
registro de modelos, creación de producto y conservación de URLs de ventas.

El código y resultados para el PDF están en
[ENTREGA_ADMIN.md](django_ecommerce/ENTREGA_ADMIN.md). Es una implementación académica
para gestionar datos; no agrega pagos ni procesamiento real de pedidos.
No se ejecutaron `git add`, `git commit` ni `git push` en esta actividad.
El futuro commit será **Registrando modelos en el Django Admin**.

## Gráfica de Ventas

Gráfica de barras con Chart.js cargado desde el CDN jsDelivr indicado por su
[documentación oficial](https://www.chartjs.org/docs/latest/getting-started/).
La página extiende la plantilla base de HDev Store y se abre desde la navegación.

- Página: http://127.0.0.1:8000/ventas/grafica/.
- Endpoint JSON: http://127.0.0.1:8000/ventas/datos/.
- `SalesDataView.get()` devuelve `labels` y `sales` mediante `JsonResponse`.
- `sales_chart.js` utiliza `fetch()` para solicitar el JSON por GET sin recargar.
- Los datos son demostrativos: seis importes mensuales de enero a junio en MXN.
  No provienen de Order ni del checkout por sesiones y no representan ventas reales.
- La página muestra errores de carga y un resumen textual de los valores.

Desde `django_ecommerce/`, con el entorno existente:

```powershell
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py runserver
```

Validación: `check` sin problemas, `makemigrations --check` sin cambios y **38 pruebas
aprobadas**, incluidas las 34 anteriores. No se añadieron modelos ni migraciones.
Se requiere JavaScript y acceso al CDN para dibujar la gráfica.
El código para el PDF está en [ENTREGA_GRAFICA_VENTAS.md](django_ecommerce/ENTREGA_GRAFICA_VENTAS.md).
El futuro commit será **Gráfica de Ventas**. No se ejecutaron git add, commit ni push.

## Forms

Registro de usuarios Django en **http://127.0.0.1:8000/registro/**, accesible mediante
«Registrarse». `RegistroUsuarioForm` hereda de `UserCreationForm`, un ModelForm
especializado de Django para User. Permite username, nombre, apellidos, correo y
confirmación de contraseña. El correo es obligatorio, se normaliza a minúsculas y
se comprueba con email__iexact para rechazar duplicados.

La vista acepta GET/POST, guarda únicamente formularios válidos mediante form.save(),
muestra un mensaje de éxito y redirige al registro sin iniciar sesión automáticamente.
Django almacena la contraseña con hash; CSRF protege el POST. Los usuarios se pueden
consultar en el Admin existente, en Usuarios, con una cuenta administradora.

Desde `django_ecommerce/`:

```powershell
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py runserver
```

Resultados: check sin problemas, ninguna migración nueva y **47 pruebas aprobadas**
(38 anteriores y nueve nuevas). Se comprobaron el formulario en Edge a 375 y 1440 px,
y el flujo de creación, mensaje y consulta en Admin mediante pruebas Django aisladas.
Código y pasos para el PDF en [ENTREGA_FORMS.md](django_ecommerce/ENTREGA_FORMS.md).
La validación del correo se realiza en el formulario; el modelo User estándar no
impone unicidad de email en la base de datos. No hay verificación de correo ni login
público en esta actividad. React conserva su autenticación simulada independiente.
No se ejecutaron git add, commit ni push. El futuro commit será exactamente **Forms**.

## Django Templates

Demostración académica en **http://127.0.0.1:8000/templates-demo/**, accesible desde
la navegación existente. Utiliza filtros title, upper, lower, length, truncatechars
y floatformat; un ciclo for con empty y forloop.counter, first y last; y divisibleby
para marcar únicamente las posiciones 3 y 6.

La página hereda de base.html. Un include reutilizable recibe explícitamente el
producto, número, indicadores de primera/última posición y es_divisible mediante
ramas if. Usa `only` para aislar el contexto del fragmento y las clases CSS existentes.
Los seis productos son datos en memoria; no se guardan en la base de datos.

Desde django_ecommerce, ejecutar:

```powershell
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py runserver
```

Resultados: check sin problemas, ninguna migración nueva y **53 pruebas aprobadas**,
incluidas las 47 anteriores. Código para el PDF en
[ENTREGA_DJANGO_TEMPLATES.md](django_ecommerce/ENTREGA_DJANGO_TEMPLATES.md).
El futuro commit será **Django Templates**. No se ejecutaron git add, commit ni push.

## Paginación en Django Rest Framework

`/api/productos/` lista productos con `PageNumberPagination`. El tamaño predeterminado es 4; `pagina` selecciona la página y `tamano` permite solicitar hasta 10 productos. Por ejemplo: `/api/productos/?pagina=2&tamano=2`. La respuesta incluye total, página actual, total de páginas, enlaces y resultados. Consulta [ENTREGA_PAGINACION_DRF.md](django_ecommerce/ENTREGA_PAGINACION_DRF.md).

## Autenticación en Django Rest Framework

El backend Django usa `TokenAuthentication` e `IsAuthenticated` para proteger `GET /api/perfil/`, que devuelve únicamente el perfil del usuario autenticado. `POST /api/token/` recibe `username` y `password` y entrega el token. Para consultar el perfil, envía `Authorization: Token <token>`. No incluyas tokens reales en el repositorio. Consulta [ENTREGA_AUTENTICACION_DRF.md](django_ecommerce/ENTREGA_AUTENTICACION_DRF.md) para el flujo, pruebas y resultados.
