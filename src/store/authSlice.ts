import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null as User | null, registeredUser: null as User | null },
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    register(state, action: PayloadAction<User>) {
      state.registeredUser = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});
export const { login, register, logout } = authSlice.actions;
export default authSlice.reducer;
