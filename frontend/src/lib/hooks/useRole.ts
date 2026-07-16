import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

export function useRole() {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role ?? 'viewer';

  return {
    role,
    isAdmin:   role === 'admin',
    isManager: role === 'manager',
    isViewer:  role === 'viewer',
    canManage: role === 'admin' || role === 'manager',
    canAdmin:  role === 'admin',
  };
}
