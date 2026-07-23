import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    workspace_id: string;
  } | null;
  isAuthenticated: boolean;
}

// No token here, and no localStorage seeding on load. The JWT now lives only
// in the httpOnly access_token cookie the backend sets on login/register —
// JS (this store included) can't read it, so there's nothing to hydrate
// synchronously. Until the app confirms a session via GET /auth/me, it has
// to assume "unauthenticated," not "authenticated" — see DashboardLayout's
// bootstrap effect for the corresponding piece of this.
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Used both right after login/register and when GET /auth/me confirms
    // an existing session — there's no separate "set the token" case
    // anymore, so this replaces the old setAuth entirely.
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
