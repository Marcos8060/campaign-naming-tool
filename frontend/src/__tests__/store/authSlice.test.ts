import authReducer, { setAuth, logout, setUser } from '@/lib/store/slices/authSlice';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  workspace_id: 'ws-456',
};

describe('authSlice', () => {
  const emptyState = {
    token: null,
    user: null,
    isAuthenticated: false,
  };

  describe('setAuth', () => {
    it('sets token, user, and isAuthenticated', () => {
      const state = authReducer(emptyState, setAuth({ token: 'tok123', user: mockUser }));
      expect(state.token).toBe('tok123');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('persists token to localStorage', () => {
      authReducer(emptyState, setAuth({ token: 'persisted', user: mockUser }));
      expect(localStorage.getItem('auth_token')).toBe('persisted');
    });
  });

  describe('logout', () => {
    it('clears token, user, and isAuthenticated', () => {
      const loggedIn = { token: 'tok', user: mockUser, isAuthenticated: true };
      const state = authReducer(loggedIn, logout());
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('removes token from localStorage', () => {
      localStorage.setItem('auth_token', 'some-token');
      authReducer({ token: 'some-token', user: mockUser, isAuthenticated: true }, logout());
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('setUser', () => {
    it('updates user without changing token', () => {
      const initial = { token: 'tok', user: null, isAuthenticated: true };
      const state = authReducer(initial, setUser(mockUser));
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('tok');
    });

    it('can set user to null', () => {
      const initial = { token: 'tok', user: mockUser, isAuthenticated: true };
      const state = authReducer(initial, setUser(null));
      expect(state.user).toBeNull();
    });
  });
});
