import authReducer, { logout, setUser } from '@/lib/store/slices/authSlice';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  workspace_id: 'ws-456',
};

describe('authSlice', () => {
  const emptyState = {
    user: null,
    isAuthenticated: false,
  };

  // setAuth is gone — the JWT lives in an httpOnly cookie now, never in
  // Redux/localStorage, so setUser is the only action left and it derives
  // isAuthenticated from whether a user is present.
  describe('setUser', () => {
    it('sets the user and marks the session authenticated', () => {
      const state = authReducer(emptyState, setUser(mockUser));
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clears isAuthenticated when set to null', () => {
      const loggedIn = { user: mockUser, isAuthenticated: true };
      const state = authReducer(loggedIn, setUser(null));
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user and isAuthenticated', () => {
      const loggedIn = { user: mockUser, isAuthenticated: true };
      const state = authReducer(loggedIn, logout());
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
