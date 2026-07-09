import { useMutationRequest, type UseMutationRequestOptions } from './useMutationRequest';

export type UsePutOptions<TData, TVariables> = UseMutationRequestOptions<TData, TVariables>;

export function usePut<TData = any, TVariables = unknown>(options: UsePutOptions<TData, TVariables>) {
  return useMutationRequest<TData, TVariables>('PUT', options);
}
