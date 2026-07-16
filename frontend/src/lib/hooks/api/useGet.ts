import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { request, toQueryKey } from '@/lib/api/request';
import { useAuthToken } from './useAuthToken';

export interface UseGetOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'> {
  url: string;
  queryKey?: unknown[];
  enabled?: boolean;
}

export function useGet<T = any>({ url, queryKey, ...queryOptions }: UseGetOptions<T>) {
  const token = useAuthToken();

  return useQuery<T>({
    ...queryOptions,
    queryKey: queryKey ?? toQueryKey(url),
    queryFn: () => request<T>(url, { method: 'GET', token }),
  });
}
