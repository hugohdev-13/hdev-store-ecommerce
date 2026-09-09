import { configureStore } from '@reduxjs/toolkit';
import cart from './cartSlice';
import auth from './authSlice';
import checkout from './checkoutSlice';
export const createAppStore = () => configureStore({ reducer: { cart, auth, checkout } });
export const store = createAppStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
