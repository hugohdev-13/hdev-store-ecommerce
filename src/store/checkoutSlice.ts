import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../types';
const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: { order: null as Order | null },
  reducers: {
    placeOrder(state, action: PayloadAction<Order>) {
      state.order = action.payload;
    },
  },
});
export const { placeOrder } = checkoutSlice.actions;
export default checkoutSlice.reducer;
