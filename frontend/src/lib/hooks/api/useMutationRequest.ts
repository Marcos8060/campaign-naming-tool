import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { ApiError, request, type HttpMethod } from '@/lib/api/request';

export interface UseMutationRequestOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  url: string | ((variables: TVariables) => string);
  body?: unknown | ((variables: TVariables) => unknown);
  responseType?: 'json' | 'blob';
}

export function useMutationRequest<TData = any, TVariables = unknown>(
  method: HttpMethod,
  { url, body, responseType, ...mutationOptions }: UseMutationRequestOptions<TData, TVariables>,
) {
  return useMutation<TData, ApiError, TVariables>({
    ...mutationOptions,
    mutationFn: (variables: TVariables) => {
      const urlString = typeof url === 'function' ? (url as (v: TVariables) => string)(variables) : url;
      const requestBody = typeof body === 'function' ? (body as (v: TVariables) => unknown)(variables) : (body ?? variables);
      // No token to pass — the browser attaches the httpOnly session cookie
      // to this request automatically (see request.ts's credentials: 'include').
      return request<TData>(urlString, { method, body: requestBody, responseType });
    },
  });
}
