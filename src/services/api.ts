import axios from 'axios';
import type { Address, CartLine, Product } from '../types';
import { products as visualProducts } from '../data/products';

const apiBaseUrl = (import.meta as ImportMeta & { env: { VITE_API_BASE_URL?: string } }).env
  .VITE_API_BASE_URL || '/api';
export const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('hdev_token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

type ProductDto = { id: number; name: string; description: string; price: string; stock: number; available: boolean };
type ProductPage = { resultados: ProductDto[]; siguiente: string | null };

export async function fetchProducts(): Promise<Product[]> {
  const results: ProductDto[] = [];
  let url: string | null = '/productos/?tamano=10';
  while (url) {
    const { data }: { data: ProductPage } = await api.get(url);
    results.push(...data.resultados);
    url = data.siguiente ? new URL(data.siguiente).pathname + new URL(data.siguiente).search : null;
    if (url?.startsWith('/api/')) url = url.slice(4);
  }
  return results.filter((p) => p.available).map((p) => ({
    id: p.id, name: p.name, description: p.description, price: Number(p.price),
    stock: p.stock, category: visualProducts.find((v) => v.name === p.name)?.category || 'Productos',
    image: visualProducts.find((v) => v.name === p.name)?.image || '/images/setup.svg',
  }));
}

export async function registerUser(values: { name: string; lastName: string; email: string; password: string }) {
  return api.post('/registro/', {
    username: values.email.trim().toLowerCase(), first_name: values.name.trim(),
    last_name: values.lastName.trim(), email: values.email.trim().toLowerCase(), password: values.password,
  });
}

export async function signIn(email: string, password: string) {
  const { data } = await api.post<{ token: string }>('/token/', { username: email.trim().toLowerCase(), password });
  sessionStorage.setItem('hdev_token', data.token);
  const profile = await api.get<{ first_name: string; last_name: string; email: string }>('/perfil/');
  return { name: [profile.data.first_name, profile.data.last_name].filter(Boolean).join(' ') || email, email: profile.data.email };
}

export async function createOrder(items: CartLine[], address: Address) {
  const { data } = await api.post<{ id: number; created_at: string; total: string }>('/ordenes/', {
    items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
    address: { street: `${address.street} ${address.number}, ${address.neighborhood}`,
      city: address.city, state: address.state, country: 'México', postal_code: address.postalCode },
  });
  return data;
}
