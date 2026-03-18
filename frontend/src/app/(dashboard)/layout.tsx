'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { setUser } from '@/lib/store/slices/authSlice';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { apiClient } from '@/lib/api/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  useWorkspace();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  // Rehydrate user after page refresh
  useEffect(() => {
    if (isAuthenticated && !user) {
      apiClient.get('/auth/me').then(({ data }) => dispatch(setUser(data))).catch(() => {});
    }
  }, [isAuthenticated, user, dispatch]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
      <Sidebar />

      {/* Content — offset by sidebar on lg+ */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        transition-all duration-300
        lg:${sidebarOpen ? 'ml-60' : 'ml-[70px]'}
      `}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
