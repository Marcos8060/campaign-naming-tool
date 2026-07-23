import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { setUser, logout } from '@/lib/store/slices/authSlice';
import { usePost } from '@/lib/hooks/api';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/api/request';

interface AuthResponse {
  // No access_token here — the backend sets it as an httpOnly cookie now
  // and no longer includes it in the response body at all.
  user: NonNullable<RootState['auth']['user']>;
}

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const loginMutation = usePost<AuthResponse, { email: string; password: string }>({ url: '/auth/login' });
  const registerMutation = usePost<
    AuthResponse,
    { email: string; password: string; name: string; workspace_name: string }
  >({ url: '/auth/register' });

  const login = async (email: string, password: string) => {
    const data = await loginMutation.mutateAsync({ email, password });
    dispatch(setUser(data.user));
    return data;
  };

  const register = async (email: string, password: string, name: string, workspace_name: string) => {
    const data = await registerMutation.mutateAsync({ email, password, name, workspace_name });
    dispatch(setUser(data.user));
    return data;
  };

  const signOut = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      dispatch(logout());
      router.push('/login');
    }
  };

  return { user, isAuthenticated, login, register, signOut };
}
