# Entrega de HDev Store

## Estado inicial

La carpeta de trabajo estaba vacía: sin código, package.json, dependencias o repositorio Git. El archivo prueba.py abierto en el IDE no estaba guardado en esta carpeta. No se eliminó ni reemplazó código preexistente.

## Archivos creados

Inventario completo de archivos fuente, configuración, documentación y recursos locales (excluye node_modules, dist y capturas generadas):

- `.gitignore`
- `.prettierignore`
- `.prettierrc.json`
- `e2e/store.spec.ts`
- `ENTREGA.md`
- `index.html`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `public/favicon.svg`
- `public/images/headphones.svg`
- `public/images/hub.svg`
- `public/images/keyboard.svg`
- `public/images/laptop.svg`
- `public/images/monitor.svg`
- `public/images/mouse.svg`
- `public/images/ram.svg`
- `public/images/setup.svg`
- `public/images/ssd.svg`
- `README.md`
- `src/App.tsx`
- `src/components/CartItem.tsx`
- `src/components/common/FormField.tsx`
- `src/components/common/UI.tsx`
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/components/Layout.tsx`
- `src/components/Logo.tsx`
- `src/components/OrderSummary.tsx`
- `src/components/ProductCard.tsx`
- `src/components/ProductGrid.tsx`
- `src/data/products.ts`
- `src/main.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Cart.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/Home.tsx`
- `src/pages/Login.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/OrderConfirmation.tsx`
- `src/pages/Register.tsx`
- `src/store/authSlice.ts`
- `src/store/cartSlice.ts`
- `src/store/checkoutSlice.ts`
- `src/store/hooks.ts`
- `src/store/store.ts`
- `src/styles/GlobalStyles.ts`
- `src/styles/styled.d.ts`
- `src/styles/theme.ts`
- `src/tests/cartSlice.test.ts`
- `src/tests/components.test.tsx`
- `src/tests/render.tsx`
- `src/tests/setup.ts`
- `src/tests/validation.test.ts`
- `src/types/index.ts`
- `src/utils/format.ts`
- `src/utils/validation.ts`
- `tsconfig.json`
- `vite.config.ts`

## Archivos preexistentes modificados

Ninguno. Todos los archivos de la entrega se crearon durante esta implementación.

## Dependencias instaladas

Producción: react, react-dom, styled-components, @reduxjs/toolkit, react-redux, react-router-dom y lucide-react.

Desarrollo: typescript, vite, @vitejs/plugin-react, @types/react, @types/react-dom, vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, @playwright/test y prettier.

Las versiones declaradas están en package.json; las versiones reproducibles y dependencias transitivas, en package-lock.json.

## Funcionalidades implementadas

Login y registro simulados; Home y catálogo de ocho productos; imágenes locales; búsqueda, categorías y orden por precio; carrito Redux con control de stock, eliminación y vaciado; checkout con dirección y pago ficticio validado; confirmación con copia de la orden, número, fecha, total y dirección; menú responsive; 404; estados vacíos; etiquetas accesibles; estilo con styled-components; hooks Redux tipados.

## Pruebas implementadas y resultados

- ProductCard: nombre, precio, botón y actualización de Redux.
- Cart: productos, aumento, disminución, eliminación y vaciado.
- Login: campos obligatorios, errores, inicio simulado y navegación.
- Register: campos, confirmación de contraseña y perfil sin contraseñas guardadas.
- Checkout: bloques, dirección inválida, ausencia de pago, pago inválido, invalidación al editar, carrito vacío y confirmación con conservación de productos y vaciado del carrito.
- cartSlice: cinco acciones requeridas, acumulación, límites de stock y cantidades, productos agotados e identificadores inexistentes.
- Validaciones: dirección, tarjeta ficticia, CVV, fecha vencida y mes vigente.
- E2E: ocho rutas a 375, 768, 1024 y 1440 px, errores de consola, carga de imágenes, scroll horizontal, menú móvil, filtros, orden y compra completa en celular.

Verificación realizada el 9 de septiembre de 2026:

| Comando              | Resultado                                           |
| -------------------- | --------------------------------------------------- |
| npm run build        | Correcto: TypeScript estricto y build Vite en dist/ |
| npm test             | 19 pruebas aprobadas, 3 archivos                    |
| npm run test:e2e     | 6 pruebas aprobadas en Microsoft Edge               |
| npm run format:check | Todos los archivos comprobados cumplen el formato   |

Se revisaron visualmente la captura de Home en escritorio y la del checkout en celular. Las capturas de los cuatro anchos y checkout móvil están en test-results/ y no se incluyen en Git.

## Pendientes y límites

No hay requisitos funcionales pendientes de la actividad. La sesión, el registro, el carrito y la orden viven en memoria y se reinician al recargar. Autenticación, productos y pagos son simulados; no hay backend ni base de datos real. El despliegue requiere fallback a index.html para las rutas de BrowserRouter.

El proyecto queda listo para crear un repositorio y subirlo a GitHub. No se inicializó Git, no se hicieron commits y no se publicó el sitio. El README explica instalación, uso, pruebas y despliegue.
