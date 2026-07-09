import { useMutationRequest, type UseMutationRequestOptions } from './useMutationRequest';

export type UsePatchOptions<TData, TVariables> = UseMutationRequestOptions<TData, TVariables>;

/**
 * Not in the original four-hook spec, but every existing mutation in this
 * codebase is PATCH, not PUT (workspaces, users, campaigns, branding — see
 * grep across `app/(dashboard)`). Added alongside `usePut` so migration
 * doesn't force PATCH endpoints into the wrong verb.
 */
export function usePatch<TData = any, TVariables = unknown>(options: UsePatchOptions<TData, TVariables>) {
  return useMutationRequest<TData, TVariables>('PATCH', options);
}
