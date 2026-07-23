import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { request, toQueryKey } from '@/lib/api/request';

export interface UseGetOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'> {
  url: string;
  queryKey?: unknown[];
  enabled?: boolean;
}

export function useGet<T = any>({ url, queryKey, ...queryOptions }: UseGetOptions<T>) {
  return useQuery<T>({
    ...queryOptions,
    queryKey: queryKey ?? toQueryKey(url),
    // No token to pass — the browser attaches the httpOnly session cookie
    // to this request automatically (see request.ts's credentials: 'include').
    queryFn: () => request<T>(url, { method: 'GET' }),
  });
}
