import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';

/**
 * The app's auth token lives in Redux (see `authSlice.ts`), synced to
 * `localStorage` on login/logout — there's no async token exchange here,
 * unlike SDKs (Clerk/Auth0-style) where token retrieval is a promise. This
 * hook just reads it synchronously so the four API hooks below never touch
 * `localStorage` or the store directly.
 */
export function useAuthToken(): string | null {
  return useSelector((state: RootState) => state.auth.token);
}
