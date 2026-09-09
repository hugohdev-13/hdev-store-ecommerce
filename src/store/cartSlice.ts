import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartLine, Product } from '../types';
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as CartLine[] },
  reducers: {
    addToCart(state, { payload: product }: PayloadAction<Product>) {
      const line = state.items.find((item) => item.product.id === product.id);
      if (line) {
        if (line.quantity < line.product.stock) line.quantity++;
      } else if (product.stock > 0) state.items.push({ product, quantity: 1 });
    },
    removeFromCart(state, { payload }: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.product.id !== payload);
    },
    increaseQuantity(state, { payload }: PayloadAction<number>) {
      const line = state.items.find((item) => item.product.id === payload);
      if (line && line.quantity < line.product.stock) line.quantity++;
    },
    decreaseQuantity(state, { payload }: PayloadAction<number>) {
      const line = state.items.find((item) => item.product.id === payload);
      if (line && line.quantity > 1) line.quantity--;
    },
    clearCart(state) {
      state.items = [];
    },
  },
});
export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
