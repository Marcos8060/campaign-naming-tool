import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

/**
 * Centralised role utilities. Use this everywhere instead of
 * re-implementing user?.role comparisons inline.
 */
export function useRole() {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role ?? 'viewer';

  return {
    role,
    isAdmin:   role === 'admin',
    isManager: role === 'manager',
    isViewer:  role === 'viewer',
    /** Can create / edit / manage campaigns and taxonomies */
    canManage: role === 'admin' || role === 'manager',
    /** Full control — invite/remove team, change theme, delete taxonomies */
    canAdmin:  role === 'admin',
  };
}
