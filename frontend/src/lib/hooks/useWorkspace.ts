import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { apiClient } from '@/lib/api/client';
import { setWorkspace } from '@/lib/store/slices/workspaceSlice';
import { RootState } from '@/lib/store';

export function useWorkspace() {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state: RootState) => state.workspace);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const query = useQuery({
    queryKey: ['workspace', 'current'],
    queryFn: async () => {
      const { data } = await apiClient.get('/workspaces/current');
      dispatch(setWorkspace(data));
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return {
    workspace: currentWorkspace || query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
