import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { request, toQueryKey } from '@/lib/api/request';
import { useAuthToken } from './useAuthToken';

export interface UseGetOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'> {
  url: string;
  /** Override the derived query key (defaults to the url's path segments). */
  queryKey?: unknown[];
  enabled?: boolean;
}

/**
 * Thin wrapper around `useQuery` for GET requests. Every screen that reads
 * data from the API should go through this instead of calling `apiClient.get`
 * (or `fetch`) directly.
 *
 * The project's existing QueryClient default (`staleTime: 60_000`, see
 * `app/providers.tsx`) already governs caching, so we don't override it here
 * — pass `staleTime`/`gcTime` per call if a screen needs something different.
 */
export function useGet<T = any>({ url, queryKey, ...queryOptions }: UseGetOptions<T>) {
  const token = useAuthToken();

  return useQuery<T>({
    ...queryOptions,
    queryKey: queryKey ?? toQueryKey(url),
    queryFn: () => request<T>(url, { method: 'GET', token }),
  });
}
