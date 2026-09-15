import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './render';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../pages/Cart';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Checkout } from '../pages/Checkout';
import { products } from '../data/products';
import { money } from '../utils/format';
import { createAppStore } from '../store/store';
import { addToCart } from '../store/cartSlice';
import App from '../App';
vi.mock('../services/api', () => ({
  fetchProducts: vi.fn().mockResolvedValue([]),
  registerUser: vi.fn().mockResolvedValue({}),
  signIn: vi.fn().mockImplementation(async (email: string) => ({ name: email.split('@')[0], email })),
  createOrder: vi.fn().mockImplementation(async (items: { product: { price: number }; quantity: number }[]) => ({
    id: 1, created_at: new Date().toISOString(),
    total: String(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)),
  })),
}));
describe('ProductCard', () => {
  it('renderiza nombre, precio y agrega mediante Redux', async () => {
    const user = userEvent.setup();
    const { store } = renderApp(<ProductCard product={products[0]} />);
    expect(screen.getByRole('heading', { name: 'HDev Pro 14' })).toBeInTheDocument();
    expect(screen.getByText(money(products[0].price))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }));
    expect(store.getState().cart.items[0].quantity).toBe(1);
    expect(screen.getByRole('status')).toHaveTextContent('Agregado');
  });
});
describe('Cart', () => {
  it('muestra productos y permite aumentar, disminuir y eliminar', async () => {
    const user = userEvent.setup();
    const store = createAppStore();
    store.dispatch(addToCart(products[0]));
    renderApp(<Cart />, { store });
    expect(screen.getByRole('heading', { name: 'HDev Pro 14' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad de HDev Pro 14' }));
    expect(screen.getByLabelText('Cantidad de HDev Pro 14')).toHaveTextContent('2');
    await user.click(screen.getByRole('button', { name: 'Disminuir cantidad de HDev Pro 14' }));
    expect(screen.getByLabelText('Cantidad de HDev Pro 14')).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'Eliminar HDev Pro 14' }));
    expect(screen.getByText('Tu carrito está esperando ideas')).toBeInTheDocument();
    expect(store.getState().cart.items).toEqual([]);
  });
  it('permite vaciar todos los productos', async () => {
    const store = createAppStore();
    store.dispatch(addToCart(products[0]));
    store.dispatch(addToCart(products[1]));
    renderApp(<Cart />, { store });
    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    expect(store.getState().cart.items).toEqual([]);
  });
});
describe('Login', () => {
  it('renderiza formulario y valida campos obligatorios', async () => {
    renderApp(<Login />);
    expect(screen.getByLabelText('Correo electrónico')).toBeRequired();
    expect(screen.getByLabelText('Contraseña')).toBeRequired();
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(screen.getByText('Escribe un correo electrónico válido.')).toBeInTheDocument();
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();
  });
  it('inicia una sesión simulada y vuelve a la tienda', async () => {
    const user = userEvent.setup();
    const { store } = renderApp(<App />, { route: '/login' });
    await user.type(screen.getByLabelText('Correo electrónico'), 'demo@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'ejemplo123');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(store.getState().auth.user?.email).toBe('demo@example.com'));
    expect(await screen.findByRole('heading', { level: 1, name: /Tu espacio/ })).toBeInTheDocument();
  });
});
describe('Register', () => {
  it('muestra campos y valida contraseñas coincidentes', async () => {
    const user = userEvent.setup();
    renderApp(<Register />);
    for (const label of [
      'Nombre',
      'Apellidos',
      'Correo electrónico',
      'Contraseña',
      'Confirmación de contraseña',
    ])
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Contraseña'), 'ejemplo123');
    await user.type(screen.getByLabelText('Confirmación de contraseña'), 'otra12345');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });
  it('registra un perfil sin almacenar contraseñas', async () => {
    const user = userEvent.setup();
    const { store } = renderApp(<App />, { route: '/register' });
    for (const [label, value] of Object.entries({
      Nombre: 'Hugo',
      Apellidos: 'Hernández',
      'Correo electrónico': 'hugo@example.com',
      Contraseña: 'ejemplo123',
      'Confirmación de contraseña': 'ejemplo123',
    }))
      await user.type(screen.getByLabelText(label), value);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(store.getState().auth.registeredUser).toEqual({
      name: 'Hugo Hernández',
      email: 'hugo@example.com',
    });
  });
});
describe('Checkout', () => {
  it('renderiza dirección, pago y resumen, y bloquea dirección inválida', async () => {
    const store = createAppStore();
    store.dispatch(addToCart(products[0]));
    renderApp(<Checkout />, { store });
    for (const name of ['Dirección de envío', 'Método de pago', 'Resumen del pedido'])
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));
    expect(screen.getByText('Revisa los campos de la dirección de envío.')).toBeInTheDocument();
    expect(store.getState().checkout.order).toBeNull();
    expect(store.getState().cart.items).toHaveLength(1);
  });
  it('bloquea carrito vacío', () => {
    renderApp(<Checkout />);
    expect(
      screen.getByText('Necesitas al menos un producto para continuar la compra.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar compra' })).not.toBeInTheDocument();
  });
  it('valida pago, invalida cambios y confirma una orden completa', async () => {
    const user = userEvent.setup();
    const store = createAppStore();
    store.dispatch(addToCart(products[0]));
    store.dispatch(addToCart(products[0]));
    renderApp(<App />, { store, route: '/checkout' });
    for (const [label, value] of Object.entries({
      'Nombre completo': 'Hugo Hernández',
      Calle: 'Reforma',
      Número: '123',
      Colonia: 'Centro',
      Ciudad: 'Puebla',
      Estado: 'Puebla',
      'Código postal': '72000',
      Teléfono: '2221234567',
    }))
      await user.type(screen.getByLabelText(label), value);
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }));
    expect(
      screen.getByText('Guarda un método de pago simulado válido antes de continuar.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Guardar método de pago' }));
    expect(screen.getByText('Usa 16 dígitos ficticios.')).toBeInTheDocument();
    for (const [label, value] of Object.entries({
      'Nombre del titular': 'Hugo Hernández',
      'Número de tarjeta': '4242424242424242',
      'Fecha de expiración': '12/99',
      CVV: '123',
    }))
      await user.type(screen.getByLabelText(label), value);
    await user.click(screen.getByRole('button', { name: 'Guardar método de pago' }));
    expect(screen.getByRole('status')).toHaveTextContent('guardado correctamente');
    await user.type(screen.getByLabelText('Nombre del titular'), ' M');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Guardar método de pago' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }));
    expect(await screen.findByRole('heading', { name: '¡Compra realizada correctamente!' })).toBeInTheDocument();
    expect(store.getState().cart.items).toEqual([]);
    const order = store.getState().checkout.order;
    expect(order?.total).toBe(31998);
    expect(order?.items[0].quantity).toBe(2);
    expect(order?.address.city).toBe('Puebla');
    expect(JSON.stringify(store.getState())).not.toContain('4242424242424242');
    expect(order).not.toHaveProperty('cvv');
  });
});
