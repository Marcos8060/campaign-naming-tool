import { store } from '@/lib/store';
import { logout } from '@/lib/store/slices/authSlice';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export type ApiErrorBody = Record<string, unknown>;

function extractMessage(body: ApiErrorBody, statusCode: number): string {
  if (typeof body?.detail === 'string') return body.detail;
  if (Array.isArray(body?.detail) && body.detail[0]?.msg) return String(body.detail[0].msg);
  if (typeof body?.message === 'string') return body.message;
  return `API Error: ${statusCode}`;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: ApiErrorBody,
  ) {
    super(extractMessage(body, statusCode));
    this.name = 'ApiError';
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method: HttpMethod;
  body?: unknown;
  responseType?: 'json' | 'blob';
  headers?: Record<string, string>;
  /** Internal — marks a request as already having gone through one
   * refresh-and-retry cycle, so the 401 handler doesn't attempt a second
   * one (or loop) if it fails again. Not meant to be passed by callers. */
  _isRetry?: boolean;
}

// Endpoints that must never trigger the refresh-and-retry flow below: a
// failed login/register is just a normal error to surface to the user
// (not a session expiring), and a failed /auth/refresh or /auth/logout
// call retrying itself would loop.
function isAuthEndpoint(path: string): boolean {
  return (
    path.includes('/auth/login') ||
    path.includes('/auth/register') ||
    path.includes('/auth/refresh') ||
    path.includes('/auth/logout')
  );
}

export function toQueryKey(url: string): string[] {
  return url.split('?')[0].split('/').filter(Boolean);
}

// Access tokens are short-lived (15 min) by design — see backend
// config.jwt_expiration — so any session longer than that will hit a 401
// on its next request. Multiple requests can also 401 around the same
// moment (e.g. a page firing several queries right as the token expires).
// Sharing one in-flight refresh promise means they all wait on a single
// /auth/refresh call instead of each independently racing to refresh —
// which matters here specifically because refresh tokens rotate: only the
// first of several concurrent refresh attempts would actually succeed,
// and the others would incorrectly look like theft/reuse.
let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function request<T>(url: string, options: RequestOptions): Promise<T> {
  const path = url.startsWith('/') ? url : `/${url}`;
  const hasBody = options.body !== undefined && options.method !== 'GET' && options.method !== 'DELETE';
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method,
    credentials: 'include',
    headers: {
      ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: hasBody ? (isFormData ? (options.body as FormData) : JSON.stringify(options.body)) : undefined,
  });

  if (!response.ok) {
    const canRetryWithRefresh =
      response.status === 401 && !options._isRetry && !isAuthEndpoint(path) && typeof window !== 'undefined';

    if (canRetryWithRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(url, { ...options, _isRetry: true });
      }
    }

    if (response.status === 401 && !isAuthEndpoint(path) && typeof window !== 'undefined') {
      // Either this was already a retry (refresh succeeded but the retried
      // request still 401'd — shouldn't normally happen) or refresh itself
      // failed. Either way, the session is genuinely over.
      store.dispatch(logout());
      window.location.href = '/login';
    }

    const errorBody: ApiErrorBody = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;

  if (options.responseType === 'blob') {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}
