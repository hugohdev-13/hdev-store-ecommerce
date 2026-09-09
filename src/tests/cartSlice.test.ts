import { describe, it, expect } from 'vitest';
import reducer, {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from '../store/cartSlice';
import { products } from '../data/products';
describe('cartSlice', () => {
  it('agrega productos y acumula la cantidad sin duplicar líneas', () => {
    let state = reducer(undefined, addToCart(products[0]));
    state = reducer(state, addToCart(products[0]));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });
  it('aumenta y disminuye cantidades', () => {
    let state = reducer(undefined, addToCart(products[0]));
    state = reducer(state, increaseQuantity(1));
    expect(state.items[0].quantity).toBe(2);
    state = reducer(state, decreaseQuantity(1));
    expect(state.items[0].quantity).toBe(1);
    state = reducer(state, decreaseQuantity(1));
    expect(state.items[0].quantity).toBe(1);
  });
  it('elimina un producto y conserva el resto', () => {
    let state = reducer(undefined, addToCart(products[0]));
    state = reducer(state, addToCart(products[1]));
    state = reducer(state, removeFromCart(1));
    expect(state.items.map((i) => i.product.id)).toEqual([2]);
  });
  it('vacía el carrito', () => {
    expect(reducer(reducer(undefined, addToCart(products[0])), clearCart()).items).toEqual([]);
  });
  it('respeta stock y no agrega productos agotados', () => {
    const product = { ...products[0], stock: 1 };
    let state = reducer(undefined, addToCart(product));
    state = reducer(state, addToCart(product));
    state = reducer(state, increaseQuantity(product.id));
    expect(state.items[0].quantity).toBe(1);
    expect(reducer(undefined, addToCart({ ...product, stock: 0 })).items).toEqual([]);
  });
  it('ignora identificadores inexistentes', () => {
    const state = reducer(undefined, addToCart(products[0]));
    expect(reducer(state, increaseQuantity(999))).toEqual(state);
    expect(reducer(state, decreaseQuantity(999))).toEqual(state);
  });
});
