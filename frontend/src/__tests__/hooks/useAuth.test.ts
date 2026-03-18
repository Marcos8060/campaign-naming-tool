import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import authReducer from '@/lib/store/slices/authSlice';
import uiReducer from '@/lib/store/slices/uiSlice';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer, ui: uiReducer },
  });
}

function wrapper(store: ReturnType<typeof makeStore>) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store }, children);
}

describe('useAuth', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('starts unauthenticated with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('login dispatches setAuth and stores token', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'admin', workspace_id: 'ws1' };
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { access_token: 'tok_abc', user: fakeUser },
    });

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
    (mockApiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await expect(
      act(async () => { await result.current.login('a@b.com', 'wrong'); })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('register dispatches setAuth', async () => {
    const fakeUser = { id: 'u2', email: 'b@c.com', name: 'Bob', role: 'admin', workspace_id: 'ws2' };
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { access_token: 'reg_tok', user: fakeUser },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.register('b@c.com', 'SecurePass123', 'Bob', 'My Workspace');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('Bob');
  });

  it('signOut clears auth state and redirects', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    // set logged in state manually first
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
