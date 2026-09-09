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
