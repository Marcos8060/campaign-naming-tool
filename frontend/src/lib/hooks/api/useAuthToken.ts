import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';

export function useAuthToken(): string | null {
  return useSelector((state: RootState) => state.auth.token);
}
