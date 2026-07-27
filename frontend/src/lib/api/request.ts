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
  _isRetry?: boolean;
}

function isAuthEndpoint(path: string): boolean {
  return (
    path.includes('/auth/login') ||
    path.includes('/auth/register') ||
    path.includes('/auth/refresh') ||
    path.includes('/auth/logout')
  );
}

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

// Backend's double-submit-cookie CSRF check (see backend/src/core/csrf.py)
// requires this cookie's value echoed back as a header on every
// state-changing request. Unlike access_token/refresh_token, this cookie
// is deliberately readable by JS — that's the whole mechanism.
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function toQueryKey(url: string): string[] {
  return url.split('?')[0].split('/').filter(Boolean);
}

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
  const isMutating = options.method !== 'GET';
  const csrfToken = isMutating ? getCsrfToken() : null;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method,
    credentials: 'include',
    headers: {
      ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
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
