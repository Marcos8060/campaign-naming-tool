import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { ApiError, request, type HttpMethod } from '@/lib/api/request';
import { useAuthToken } from './useAuthToken';

export interface UseMutationRequestOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  /** Static path, or a function of the mutation's variables for dynamic paths. */
  url: string | ((variables: TVariables) => string);
  /** Defaults to the mutation's variables themselves if omitted. */
  body?: unknown | ((variables: TVariables) => unknown);
  /** Set to 'blob' for file downloads (e.g. CSV export). */
  responseType?: 'json' | 'blob';
}

/**
 * Internal factory shared by usePost/usePut/usePatch/useDelete so the four
 * verb-specific hooks stay byte-for-byte the same shape instead of drifting
 * as separate copy-pasted files. Not part of the public `hooks/api` surface —
 * import the verb-specific hook instead.
 */
export function useMutationRequest<TData = any, TVariables = unknown>(
  method: HttpMethod,
  { url, body, responseType, ...mutationOptions }: UseMutationRequestOptions<TData, TVariables>,
) {
  const token = useAuthToken();

  return useMutation<TData, ApiError, TVariables>({
    ...mutationOptions,
    mutationFn: (variables: TVariables) => {
      const urlString = typeof url === 'function' ? (url as (v: TVariables) => string)(variables) : url;
      const requestBody = typeof body === 'function' ? (body as (v: TVariables) => unknown)(variables) : (body ?? variables);
      return request<TData>(urlString, { method, token, body: requestBody, responseType });
    },
  });
}
