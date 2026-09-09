export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  tag?: string;
}
export interface CartLine {
  product: Product;
  quantity: number;
}
export interface User {
  name: string;
  email: string;
}
export interface Address {
  name: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}
export interface Order {
  id: string;
  date: string;
  items: CartLine[];
  total: number;
  address: Address;
}
