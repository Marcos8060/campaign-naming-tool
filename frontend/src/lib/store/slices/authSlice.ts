import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    workspace_id: string;
  } | null;
  isAuthenticated: boolean;
}

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  user: null,
  isAuthenticated: !!getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: AuthState['user'] }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.token);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
  },
});

export const { setAuth, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
