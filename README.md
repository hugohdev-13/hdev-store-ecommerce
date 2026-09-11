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
