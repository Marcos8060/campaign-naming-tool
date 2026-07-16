import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import authReducer from '@/lib/store/slices/authSlice';
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
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(Provider, { store, children }),
    );
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
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it('starts unauthenticated with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('login dispatches setAuth and stores token', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'admin', workspace_id: 'ws1' };
    mockFetchOnce({ ok: true, status: 200, body: { access_token: 'tok_abc', user: fakeUser } });

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.login('a@b.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('tok_abc');
    expect(result.current.user).toEqual(fakeUser);
    expect(localStorage.getItem('auth_token')).toBe('tok_abc');
  });

  it('login propagates API errors', async () => {
    mockFetchOnce({ ok: false, status: 401, body: { detail: 'Invalid credentials' } });

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await expect(
      act(async () => { await result.current.login('a@b.com', 'wrong'); })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('register dispatches setAuth', async () => {
    const fakeUser = { id: 'u2', email: 'b@c.com', name: 'Bob', role: 'admin', workspace_id: 'ws2' };
    mockFetchOnce({ ok: true, status: 200, body: { access_token: 'reg_tok', user: fakeUser } });

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.register('b@c.com', 'SecurePass123', 'Bob', 'My Workspace');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('Bob');
  });

  it('signOut clears auth state and redirects', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    act(() => {
      store.dispatch({
        type: 'auth/setAuth',
        payload: {
          token: 'existing_tok',
          user: { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'admin', workspace_id: 'ws1' },
        },
      });
    });

    act(() => {
      result.current.signOut();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
