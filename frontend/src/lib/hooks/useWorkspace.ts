import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGet } from '@/lib/hooks/api';
import { setWorkspace } from '@/lib/store/slices/workspaceSlice';
import { RootState } from '@/lib/store';

export function useWorkspace() {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state: RootState) => state.workspace);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const query = useGet({
    url: '/workspaces/current',
    // Matches the key settings/page.tsx still uses (pre-migration) so both
    // share one cache entry instead of fetching/storing the workspace twice.
    queryKey: ['workspace', 'current'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) dispatch(setWorkspace(query.data));
  }, [query.data, dispatch]);

  return {
    workspace: currentWorkspace || query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
