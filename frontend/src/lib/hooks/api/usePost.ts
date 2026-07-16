import { useMutationRequest, type UseMutationRequestOptions } from './useMutationRequest';

export type UsePostOptions<TData, TVariables> = UseMutationRequestOptions<TData, TVariables>;

export function usePost<TData = any, TVariables = unknown>(options: UsePostOptions<TData, TVariables>) {
  return useMutationRequest<TData, TVariables>('POST', options);
}
