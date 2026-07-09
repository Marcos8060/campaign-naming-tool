'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { useAuth } from '@/lib/hooks/useAuth';
import { toggleDarkMode, setMobileNavOpen } from '@/lib/store/slices/uiSlice';
import { Bell, LogOut, Search, ChevronDown, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const ROLE_BADGE: Record<string, string> = {
  admin:   'bg-blue-100 text-primary dark:bg-blue-900/40 dark:text-blue-300',
  manager: 'bg-blue-100 text-primary dark:bg-blue-900/40 dark:text-blue-300',
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
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden rounded-xl hover:bg-[var(--color-primary-soft)] text-t2 hover:text-primary transition-colors flex-shrink-0"
        onClick={() => dispatch(setMobileNavOpen(true))}
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t3 z-10" />
          <Input
            type="text"
            placeholder="Search campaigns, taxonomies…"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--bd)' }}
            className="pl-9 pr-4 rounded-xl text-t1 placeholder:text-t3 focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
          />
        </div>
      </div>

      {/* Spacer on mobile */}
      <div className="flex-1 sm:hidden" />

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleDarkMode())}
          className="rounded-xl hover:bg-[var(--color-primary-soft)] text-t2 hover:text-primary transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-[var(--color-primary-soft)] text-t2 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-[var(--card)]" />
        </Button>

        {/* User menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-[var(--color-primary-soft)] transition-colors font-normal h-auto"
          >
            <div className="w-8 h-8 rounded-xl primary-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-t1 leading-tight">{user?.name || 'User'}</p>
              <Badge className={`text-[11px] font-semibold ${ROLE_BADGE[user?.role || ''] || 'bg-gray-100 text-gray-500'}`}>
                {user?.role || '—'}
              </Badge>
            </div>
            <ChevronDown className="w-4 h-4 text-t3 hidden md:block" />
          </Button>

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
                <Button
                  variant="ghost"
                  onClick={() => dispatch(toggleDarkMode())}
                  icon={darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  className="w-full justify-start gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors font-normal h-auto hover:bg-transparent"
                  style={{ color: darkMode ? '#8892a4' : '#374151' }}
                  onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(108,92,231,0.18)' : '#f0effe')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  icon={<LogOut className="w-4 h-4" />}
                  className="w-full justify-start gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium text-red-500 h-auto hover:bg-transparent hover:text-red-500"
                  onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(239,68,68,0.12)' : '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
