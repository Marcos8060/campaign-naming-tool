'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { setUser } from '@/lib/store/slices/authSlice';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { useGet } from '@/lib/hooks/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  useWorkspace();

  // The JWT lives in an httpOnly cookie now — this component can't read it,
  // so on a fresh load it has no way to know whether the visitor has a
  // valid session until it asks the server. Skipped once `user` is already
  // populated (right after login/register, or on client-side navigation
  // between dashboard pages), so this only actually round-trips once per
  // full page load.
  const { data: me, isFetched } = useGet({
    url: '/auth/me',
    enabled: !user,
    retry: false,
  });

  useEffect(() => {
    if (me) dispatch(setUser(me));
  }, [me, dispatch]);

  useEffect(() => {
    // Only bail to /login once the session check has actually settled and
    // didn't produce a user — redirecting while it's still in flight would
    // bounce a perfectly valid session to /login on every hard refresh.
    // (A 401 specifically is already handled by request()'s global 401
    // interceptor; this covers other failure modes as a fallback.)
    if (!isAuthenticated && isFetched && !me) {
      router.push('/login');
    }
  }, [isAuthenticated, isFetched, me, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
      <Sidebar />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-[70px]'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
