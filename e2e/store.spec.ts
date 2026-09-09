import { test, expect } from '@playwright/test';
for (const width of [375, 768, 1024, 1440])
  test('Navegación responsive a ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    for (const route of [
      '/',
      '/products',
      '/login',
      '/register',
      '/cart',
      '/checkout',
      '/order-confirmation',
      '/no-existe',
    ]) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy();
    }
    await page.goto('/');
    const images = page.locator('img');
    await expect(images).toHaveCount(9);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          img.evaluate(
            (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
          ),
        )
        .toBeTruthy();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'test-results/home-' + width + '.png', fullPage: true });
    expect(errors).toEqual([]);
  });
test('Compra completa en celular', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Agregar al carrito' }).first().click();
  await page.getByRole('link', { name: 'Carrito, 1 artículos' }).click();
  await page.getByRole('button', { name: 'Aumentar cantidad de HDev Pro 14' }).click();
  await page.getByRole('link', { name: 'Continuar compra' }).click();
  for (const [label, value] of Object.entries({
    'Nombre completo': 'Hugo Hernández',
    Calle: 'Reforma',
    Número: '123',
    Colonia: 'Centro',
    Ciudad: 'Puebla',
    Estado: 'Puebla',
    'Código postal': '72000',
    Teléfono: '2221234567',
    'Nombre del titular': 'Hugo Hernández',
    'Número de tarjeta': '4242424242424242',
    'Fecha de expiración': '12/99',
    CVV: '123',
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Guardar método de pago' }).click();
  await expect(page.getByRole('status')).toContainText('guardado correctamente');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: 'test-results/checkout-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(
    page.getByRole('heading', { name: '¡Compra realizada correctamente!' }),
  ).toBeVisible();
  await expect(page.getByText('Cantidad: 2', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Carrito, 0 artículos' })).toBeVisible();
  await page.getByRole('link', { name: 'Volver a la tienda' }).click();
  await expect(page).toHaveURL('/');
});
test('Filtra categorías, búsqueda, orden y menú móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Productos' })
    .click();
  await expect(page).toHaveURL('/products');
  await page.getByRole('button', { name: 'Periféricos', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(2);
  await page.getByLabel('Ordenar productos').selectOption('low');
  await expect(page.locator('article').first()).toContainText('HDev Precision');
  await page.getByLabel('Filtrar productos').fill('no existe');
  await expect(page.locator('article')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('No encontramos');
});
