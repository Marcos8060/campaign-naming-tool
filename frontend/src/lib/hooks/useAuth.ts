import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { setAuth, logout } from '@/lib/store/slices/authSlice';
import { usePost } from '@/lib/hooks/api';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  access_token: string;
  user: NonNullable<RootState['auth']['user']>;
}

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { token, user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const loginMutation = usePost<AuthResponse, { email: string; password: string }>({ url: '/auth/login' });
  const registerMutation = usePost<
    AuthResponse,
    { email: string; password: string; name: string; workspace_name: string }
  >({ url: '/auth/register' });

  const login = async (email: string, password: string) => {
    const data = await loginMutation.mutateAsync({ email, password });
    dispatch(setAuth({ token: data.access_token, user: data.user }));
    return data;
  };

  const register = async (email: string, password: string, name: string, workspace_name: string) => {
    const data = await registerMutation.mutateAsync({ email, password, name, workspace_name });
    dispatch(setAuth({ token: data.access_token, user: data.user }));
    return data;
  };

  const signOut = () => {
    dispatch(logout());
    router.push('/login');
  };

  return { token, user, isAuthenticated, login, register, signOut };
}
