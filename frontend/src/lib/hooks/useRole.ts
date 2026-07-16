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
    // True once the real user object has loaded. Right after a hard reload,
    // `user` is briefly null while /auth/me is still in flight, so `role`
    // above defaults to 'viewer' — callers doing role-gated redirects should
    // wait for isReady before trusting that default, or they'll bounce admins
    // to /dashboard for a split second on every refresh.
    isReady: user !== null,
  };
}
