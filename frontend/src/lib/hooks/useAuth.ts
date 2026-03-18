import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { setAuth, logout } from '@/lib/store/slices/authSlice';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { token, user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    dispatch(setAuth({ token: data.access_token, user: data.user }));
    return data;
  };

  const register = async (email: string, password: string, name: string, workspace_name: string) => {
    const { data } = await apiClient.post('/auth/register', { email, password, name, workspace_name });
    dispatch(setAuth({ token: data.access_token, user: data.user }));
    return data;
  };

  const signOut = () => {
    dispatch(logout());
    router.push('/login');
  };

  return { token, user, isAuthenticated, login, register, signOut };
}
