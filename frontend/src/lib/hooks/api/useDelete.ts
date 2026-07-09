import { useMutationRequest, type UseMutationRequestOptions } from './useMutationRequest';

export type UseDeleteOptions<TData, TVariables> = UseMutationRequestOptions<TData, TVariables>;

export function useDelete<TData = any, TVariables = unknown>(options: UseDeleteOptions<TData, TVariables>) {
  return useMutationRequest<TData, TVariables>('DELETE', options);
}
