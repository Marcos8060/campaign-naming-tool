'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { useAuth } from '@/lib/hooks/useAuth';
import { toggleDarkMode, setMobileNavOpen } from '@/lib/store/slices/uiSlice';
import { Bell, LogOut, Search, ChevronDown, Sun, Moon, Menu, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const MENU_WIDTH = 256; // matches w-64

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
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [measured, setMeasured] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  // Same portal + two-pass-measure approach as ActionMenu.tsx — the old
  // version positioned this menu with plain `absolute`, which meant it only
  // ever painted above content within Header's own stacking context. Since
  // the routed page content is a DOM sibling elsewhere in the layout, its
  // buttons could end up rendered on top of parts of this menu instead of
  // under it (seen as page buttons visually bleeding through the dropdown).
  // Portaling to <body> with viewport-fixed coordinates escapes that
  // entirely, same fix as the campaigns row action menu.
  useLayoutEffect(() => {
    if (!menuOpen) {
      setPosition(null);
      setMeasured(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 8, left: rect.right - MENU_WIDTH });
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (!menuOpen || !position || measured) return;
    const trigger = triggerRef.current?.getBoundingClientRect();
    const menu = menuRef.current?.getBoundingClientRect();
    if (!trigger || !menu) return;

    const fitsBelow = window.innerHeight - trigger.bottom >= menu.height + 8;
    setPosition({
      top: fitsBelow ? trigger.bottom + 8 : Math.max(8, trigger.top - menu.height - 8),
      left: Math.max(8, trigger.right - MENU_WIDTH),
    });
    setMeasured(true);
  }, [menuOpen, position, measured]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuOpen]);

  return (
    <header
      style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--bd)' }}
      className="h-16 border-b flex items-center justify-between px-4 md:px-6 flex-shrink-0 gap-3"
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden rounded-xl hover:bg-[var(--color-primary-soft)] text-t2 hover:text-primary transition-colors flex-shrink-0"
        onClick={() => dispatch(setMobileNavOpen(true))}
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </Button>

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

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleDarkMode())}
          className="rounded-xl hover:bg-[var(--color-primary-soft)] text-t2 hover:text-primary transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-[var(--color-primary-soft)] text-t2 hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-[var(--sidebar-bg)]" />
        </Button>

        <div className="relative">
          <Button
            ref={triggerRef}
            variant="ghost"
            onClick={() => setMenuOpen((o) => !o)}
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

          {menuOpen && position && createPortal(
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                ref={menuRef}
                className="fixed w-64 rounded-2xl overflow-hidden z-50"
                style={{
                  top: position.top,
                  left: position.left,
                  background: 'var(--sidebar-bg)',
                  border: '1px solid var(--bd)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 3px 12px rgba(0,0,0,0.10)',
                  visibility: measured ? 'visible' : 'hidden',
                }}
              >
                <div className="px-4 py-3 space-y-3" style={{ borderBottom: '1px solid var(--bd-light)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--t2)' }}>
                        {user?.email || ''}
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" className="gap-1 w-fit">
                    <ShieldCheck className="w-3 h-3" />
                    {user?.role || '—'}
                  </Badge>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => dispatch(toggleDarkMode())}
                    role="switch"
                    aria-checked={darkMode}
                    className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors font-normal"
                    style={{ color: 'var(--t2)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-soft)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="flex items-center gap-2.5">
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      Dark mode
                    </span>
                    <span
                      aria-hidden="true"
                      className="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors"
                      style={{ background: darkMode ? 'var(--color-primary)' : 'var(--bd)' }}
                    >
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                        style={{ transform: darkMode ? 'translateX(18px)' : 'translateX(3px)' }}
                      />
                    </span>
                  </button>
                </div>

                <div className="p-2" style={{ borderTop: '1px solid var(--bd-light)' }}>
                  <Button
                    variant="outline"
                    onClick={signOut}
                    icon={<LogOut className="w-4 h-4" />}
                    className="w-full justify-center gap-2 text-sm rounded-xl font-medium text-red-500 border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </>,
            document.body,
          )}
        </div>
      </div>
    </header>
  );
}
