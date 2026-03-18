'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { useAuth } from '@/lib/hooks/useAuth';
import { toggleDarkMode, setMobileNavOpen } from '@/lib/store/slices/uiSlice';
import { Bell, LogOut, Search, ChevronDown, Sun, Moon, Menu } from 'lucide-react';

const ROLE_BADGE: Record<string, string> = {
  admin:   'bg-blue-100 text-[#2e6be4] dark:bg-blue-900/40 dark:text-blue-300',
  manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  viewer:  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export function Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--bd)' }}
      className="h-16 border-b flex items-center justify-between px-4 md:px-6 flex-shrink-0 gap-3"
    >
      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-2 rounded-xl hover:bg-[var(--brand-soft)] text-t2 hover:text-brand transition-colors flex-shrink-0"
        onClick={() => dispatch(setMobileNavOpen(true))}
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t3" />
          <input
            type="text"
            placeholder="Search campaigns, taxonomies…"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--bd)' }}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm text-t1 placeholder:text-t3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
          />
        </div>
      </div>

      {/* Spacer on mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-xl hover:bg-[var(--brand-soft)] text-t2 hover:text-brand transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-[var(--brand-soft)] text-t2 hover:text-brand transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full border-2 border-[var(--card)]" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-[var(--brand-soft)] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-t1 leading-tight">{user?.name || 'User'}</p>
              <span className={`text-[11px] font-semibold capitalize px-1.5 py-0.5 rounded-full ${ROLE_BADGE[user?.role || ''] || 'bg-gray-100 text-gray-500'}`}>
                {user?.role || '—'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-t3 hidden md:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl overflow-hidden"
              style={{
                background: darkMode ? '#1e1e38' : '#ffffff',
                border: darkMode ? '1px solid #252545' : '1px solid #d1d5db',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 3px 12px rgba(0,0,0,0.10)',
              }}
            >
              {/* User info header */}
              <div className="px-4 py-3"
                style={{ borderBottom: darkMode ? '1px solid #252545' : '1px solid #e5e7eb' }}
              >
                <p className="text-sm font-semibold" style={{ color: darkMode ? '#eef0f8' : '#1a1a2e' }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: darkMode ? '#8892a4' : '#6b7280' }}>
                  {user?.email || ''}
                </p>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => dispatch(toggleDarkMode())}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors"
                  style={{ color: darkMode ? '#8892a4' : '#374151' }}
                  onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(108,92,231,0.18)' : '#f0effe')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium text-red-500"
                  onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(239,68,68,0.12)' : '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
