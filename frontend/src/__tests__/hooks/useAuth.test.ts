import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import authReducer from '@/lib/store/slices/authSlice';
import { setUser } from '@/lib/store/slices/authSlice';
import uiReducer from '@/lib/store/slices/uiSlice';
import { useAuth } from '@/lib/hooks/useAuth';

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  });
}

// useAuth now goes through usePost -> useMutation, which needs a
// QueryClientProvider ancestor. Mutations are also given retry: false so
// failed-login assertions don't hang waiting on React Query's retry backoff.
function wrapper(store: ReturnType<typeof makeStore>) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      // react-redux's ProviderProps requires `children` on the props object itself
      // (unlike plain DOM/host components), so passing it positionally instead
      // satisfies react/no-children-prop but fails typecheck. Keep it in props here.
      // eslint-disable-next-line react/no-children-prop
      React.createElement(Provider, { store, children }),
    );
  }
  return Wrapper;
}

function mockFetchOnce(response: { ok: boolean; status: number; body: unknown }) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: response.ok,
    status: response.status,
    json: async () => response.body,
  });
}

describe('useAuth', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('starts unauthenticated with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login dispatches setUser and populates user state', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'admin', workspace_id: 'ws1' };
    // No access_token in the body anymore — the backend sets it as an
    // httpOnly cookie and never puts it in JSON.
    mockFetchOnce({ ok: true, status: 200, body: { user: fakeUser } });

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.login('a@b.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(fakeUser);
  });

  it('login propagates API errors', async () => {
    mockFetchOnce({ ok: false, status: 401, body: { detail: 'Invalid credentials' } });

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await expect(
      act(async () => { await result.current.login('a@b.com', 'wrong'); })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('register dispatches setUser', async () => {
    const fakeUser = { id: 'u2', email: 'b@c.com', name: 'Bob', role: 'admin', workspace_id: 'ws2' };
    mockFetchOnce({ ok: true, status: 200, body: { user: fakeUser } });

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.register('b@c.com', 'SecurePass123', 'Bob', 'My Workspace');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('Bob');
  });

  it('signOut calls the logout endpoint and clears auth state', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'admin', workspace_id: 'ws1' };

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    act(() => {
      store.dispatch(setUser(fakeUser));
    });
    expect(result.current.isAuthenticated).toBe(true);

    // signOut now hits POST /auth/logout (to clear the cookie server-side)
    // before clearing local state, so it needs a mocked response too.
    mockFetchOnce({ ok: true, status: 200, body: { message: 'Logged out' } });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
