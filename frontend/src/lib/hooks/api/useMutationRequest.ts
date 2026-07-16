import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { ApiError, request, type HttpMethod } from '@/lib/api/request';
import { useAuthToken } from './useAuthToken';

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
