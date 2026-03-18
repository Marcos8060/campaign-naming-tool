'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { toggleSidebar, setMobileNavOpen } from '@/lib/store/slices/uiSlice';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, Tag, Megaphone, BarChart2, Download,
  Image, Settings, ChevronLeft, ChevronRight, Users2, Sparkles, X,
} from 'lucide-react';
import type { NavItemProps } from '@/types/layout';

const NAV = [
  { href: '/dashboard',                  label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/taxonomies',                 label: 'Taxonomies',       icon: Tag },
  { href: '/campaigns',                  label: 'Campaigns',        icon: Megaphone },
  { href: '/analytics',                  label: 'Analytics',        icon: BarChart2 },
  { href: '/analytics/audience-overlap', label: 'Audience Overlap', icon: Users2, indent: true },
  { href: '/exports',                    label: 'Exports',          icon: Download },
  { href: '/assets',                     label: 'Assets',           icon: Image },
];
const BOTTOM_NAV = [{ href: '/settings', label: 'Settings', icon: Settings }];


function NavItem({
  href, label, icon: Icon, indent, active, collapsed, onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed && !indent ? label : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl transition-all duration-150 group relative',
        collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
        indent && !collapsed ? 'ml-5 py-2' : '',
        active
          ? 'brand-gradient text-white shadow-sm shadow-violet-300/30'
          : 'text-t2 hover:bg-[var(--brand-soft)] hover:text-brand dark:hover:text-violet-300'
      )}
    >
      <Icon className={cn(
        'flex-shrink-0',
        indent ? 'w-4 h-4' : 'w-[18px] h-[18px]',
        active ? 'text-white' : ''
      )} />
      {!collapsed && (
        <span className={cn(
          'font-medium truncate',
          indent ? 'text-xs' : 'text-sm',
          active ? 'text-white' : ''
        )}>
          {label}
        </span>
      )}
    </Link>
  );
}

/* ── Desktop sidebar ─────────────────────────────────────────── */
function DesktopSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { currentWorkspace } = useSelector((state: RootState) => state.workspace);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--bd)' }}
      className={cn(
        'hidden lg:flex fixed left-0 top-0 h-full border-r z-50 transition-all duration-300 flex-col',
        sidebarOpen ? 'w-60' : 'w-[70px]'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--bd)' }}>
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg brand-gradient flex-shrink-0 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="font-extrabold text-t1 text-sm leading-tight tracking-tight">Camparc</p>
              {currentWorkspace?.name && (
                <p className="text-[11px] text-t3 truncate max-w-[120px]">{currentWorkspace.name}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg brand-gradient mx-auto flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover:bg-[var(--brand-soft)] text-t3 hover:text-brand transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon, indent }) => {
          if (indent && !sidebarOpen) return null;
          return (
            <NavItem key={href} href={href} label={label} icon={icon}
              indent={indent} active={isActive(href)} collapsed={!sidebarOpen} />
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--bd)' }}>
        {BOTTOM_NAV.map(({ href, label, icon }) => (
          <NavItem key={href} href={href} label={label} icon={icon}
            active={isActive(href)} collapsed={!sidebarOpen} />
        ))}
        {sidebarOpen && (
          <p className="text-[10px] text-t3 text-center mt-3 font-medium">Camparc v1.0</p>
        )}
      </div>
    </aside>
  );
}

/* ── Mobile drawer ───────────────────────────────────────────── */
function MobileDrawer() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { mobileNavOpen } = useSelector((state: RootState) => state.ui);
  const { currentWorkspace } = useSelector((state: RootState) => state.workspace);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const close = () => dispatch(setMobileNavOpen(false));

  if (!mobileNavOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={close}
      />
      {/* Drawer */}
      <aside
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
        className="lg:hidden fixed left-0 top-0 h-full w-72 z-50 flex flex-col shadow-2xl"
      >
        <div className="h-16 flex items-center justify-between px-5 border-b" style={{ borderColor: 'var(--bd)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-t1 text-sm tracking-tight">Camparc</p>
              {currentWorkspace?.name && (
                <p className="text-[11px] text-t3 truncate max-w-[140px]">{currentWorkspace.name}</p>
              )}
            </div>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-[var(--brand-soft)] text-t3">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon, indent }) => (
            <NavItem key={href} href={href} label={label} icon={icon}
              indent={indent} active={isActive(href)} onClick={close} />
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--bd)' }}>
          {BOTTOM_NAV.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon}
              active={isActive(href)} onClick={close} />
          ))}
          <p className="text-[10px] text-t3 text-center mt-3">Camparc v1.0</p>
        </div>
      </aside>
    </>
  );
}

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileDrawer />
    </>
  );
}
