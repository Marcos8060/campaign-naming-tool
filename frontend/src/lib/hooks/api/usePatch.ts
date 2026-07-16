import { useMutationRequest, type UseMutationRequestOptions } from './useMutationRequest';

export type UsePatchOptions<TData, TVariables> = UseMutationRequestOptions<TData, TVariables>;

export function usePatch<TData = any, TVariables = unknown>(options: UsePatchOptions<TData, TVariables>) {
  return useMutationRequest<TData, TVariables>('PATCH', options);
}
