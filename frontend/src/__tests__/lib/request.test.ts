import { request, ApiError, BASE_URL } from '@/lib/api/request';
import { store } from '@/lib/store';
import { setUser, logout } from '@/lib/store/slices/authSlice';

const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'admin', workspace_id: 'ws1' };

function mockFetchSequence(responses: Array<{ ok: boolean; status: number; body?: unknown }>) {
  const mockFetch = jest.fn();
  responses.forEach(({ ok, status, body }) => {
    mockFetch.mockResolvedValueOnce({
      ok,
      status,
      json: async () => body ?? {},
    });
  });
  global.fetch = mockFetch;
  return mockFetch;
}

describe('request() — access-token refresh-and-retry', () => {
  beforeEach(() => {
    store.dispatch(logout());
    // Stub navigation rather than letting a real assignment hit jsdom's
    // "Not implemented: navigation" path — the interceptor's fallback on a
    // failed refresh does `window.location.href = '/login'`.
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('returns data directly when the request succeeds', async () => {
    mockFetchSequence([{ ok: true, status: 200, body: { hello: 'world' } }]);
    const data = await request('/campaigns', { method: 'GET' });
    expect(data).toEqual({ hello: 'world' });
  });

  it('refreshes and retries once on a 401, returning the retried response', async () => {
    store.dispatch(setUser(fakeUser));
    mockFetchSequence([
      { ok: false, status: 401, body: { detail: 'Token expired' } }, // original request
      { ok: true, status: 200, body: {} },                           // POST /auth/refresh
      { ok: true, status: 200, body: { campaigns: [] } },            // retried request
    ]);

    const data = await request('/campaigns', { method: 'GET' });

    expect(data).toEqual({ campaigns: [] });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe(`${BASE_URL}/auth/refresh`);
    expect(store.getState().auth.isAuthenticated).toBe(true); // not logged out
  });

  it('logs out and does not retry when the refresh call itself fails', async () => {
    store.dispatch(setUser(fakeUser));
    mockFetchSequence([
      { ok: false, status: 401, body: { detail: 'Token expired' } }, // original request
      { ok: false, status: 401, body: {} },                          // POST /auth/refresh fails
    ]);

    await expect(request('/campaigns', { method: 'GET' })).rejects.toThrow(ApiError);

    expect(global.fetch).toHaveBeenCalledTimes(2); // no third (retry) call
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(window.location.href).toBe('/login');
  });

  it('does not attempt a refresh for a failed login', async () => {
    mockFetchSequence([{ ok: false, status: 401, body: { detail: 'Invalid credentials' } }]);

    await expect(
      request('/auth/login', { method: 'POST', body: { email: 'a@b.com', password: 'wrong' } }),
    ).rejects.toThrow('Invalid credentials');

    expect(global.fetch).toHaveBeenCalledTimes(1); // no refresh attempt
  });

  it('dedupes concurrent 401s into a single /auth/refresh call', async () => {
    store.dispatch(setUser(fakeUser));
    mockFetchSequence([
      { ok: false, status: 401, body: {} }, // request A
      { ok: false, status: 401, body: {} }, // request B
      { ok: true, status: 200, body: {} },  // the one shared /auth/refresh call
      { ok: true, status: 200, body: { a: 1 } },
      { ok: true, status: 200, body: { b: 2 } },
    ]);

    await Promise.all([
      request('/campaigns', { method: 'GET' }),
      request('/taxonomies', { method: 'GET' }),
    ]);

    // 2 originals + 1 shared refresh + 2 retries — never 2 refresh calls,
    // which matters because refresh tokens rotate: a second concurrent
    // refresh attempt would fail as reuse instead of just being redundant.
    expect(global.fetch).toHaveBeenCalledTimes(5);
    const refreshCalls = (global.fetch as jest.Mock).mock.calls.filter(
      (call) => call[0] === `${BASE_URL}/auth/refresh`,
    );
    expect(refreshCalls).toHaveLength(1);
  });
});
