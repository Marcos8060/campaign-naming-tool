import { store } from '@/lib/store';
import { logout } from '@/lib/store/slices/authSlice';

/**
 * Same base URL the existing axios `apiClient` uses (see `lib/api/client.ts`).
 * Kept identical on purpose so both clients hit the same backend during the
 * incremental migration.
 */
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export type ApiErrorBody = Record<string, unknown>;

/**
 * FastAPI validation/HTTP errors come back as `{ detail: ... }`, not
 * `{ message: ... }`. We check both so `.message` is always something
 * readable, and callers can still branch on the raw `.body` themselves
 * (e.g. `err.body?.detail`).
 */
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
  token?: string | null;
  body?: unknown;
  /** Set to 'blob' for file downloads (mirrors `apiClient.post(..., { responseType: 'blob' })`). */
  responseType?: 'json' | 'blob';
  headers?: Record<string, string>;
}

function isAuthEndpoint(path: string): boolean {
  return path.includes('/auth/login') || path.includes('/auth/register');
}

/**
 * Turns `/campaigns/123?limit=5` into `['campaigns', '123']` instead of using
 * the raw url string as a single-element key. This keeps `useGet` compatible
 * with the invalidation style already used across the app (e.g.
 * `queryClient.invalidateQueries({ queryKey: ['campaigns'] })` in
 * campaigns/[id]/page.tsx invalidates every query whose key *starts with*
 * 'campaigns' — a single opaque url string wouldn't match that prefix).
 */
export function toQueryKey(url: string): string[] {
  return url.split('?')[0].split('/').filter(Boolean);
}

/**
 * The single place that touches the network. Auth headers, JSON
 * (de)serialization, and error shaping all happen here exactly once —
 * components and hooks never call `fetch` directly.
 */
export async function request<T>(url: string, options: RequestOptions): Promise<T> {
  const path = url.startsWith('/') ? url : `/${url}`;
  const hasBody = options.body !== undefined && options.method !== 'GET' && options.method !== 'DELETE';
  // File uploads (asset upload, logo upload) pass a FormData body. Letting
  // fetch set its own multipart Content-Type (with boundary) is required —
  // JSON.stringify-ing a FormData instance or forcing application/json would
  // silently break the upload.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method,
    headers: {
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: hasBody ? (isFormData ? (options.body as FormData) : JSON.stringify(options.body)) : undefined,
  });

  if (!response.ok) {
    const errorBody: ApiErrorBody = await response.json().catch(() => ({}));

    // Mirror the existing axios interceptor's 401 handling (lib/api/client.ts):
    // clear the session and bounce to /login, except for auth endpoints
    // themselves (a failed login shouldn't redirect away from /login).
    if (response.status === 401 && !isAuthEndpoint(path) && typeof window !== 'undefined') {
      store.dispatch(logout());
      window.location.href = '/login';
    }

    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;

  if (options.responseType === 'blob') {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}
