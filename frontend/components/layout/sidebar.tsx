'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Boxes,
  ArrowLeftRight,
  TrendingUp,
  GanttChartSquare,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { LogoutDialog } from '@/components/auth/logout-dialog';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: dashboardData } = useDashboardSummary();
  const lowStockCount = dashboardData?.inventory?.lowStockCount ?? 0;
  const ongoingProjects = dashboardData?.projects?.ongoing ?? 0;
  const [userName, setUserName] = React.useState<string>('Yonas Kebede');
  const [userEmail, setUserEmail] = React.useState<string>('admin@gmail.com');
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('cms_user_email');
    const savedName = localStorage.getItem('cms_user_name');
    if (savedEmail) setUserEmail(savedEmail);
    if (savedName) setUserName(savedName);
  }, []);

  // Initials generator
  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: Building2,
      badge: ongoingProjects > 0 ? ongoingProjects : undefined,
    },
    {
      name: 'Materials',
      href: '/materials',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeVariant: 'warning' as const,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: ArrowLeftRight,
    },
    {
      name: 'Milestones',
      href: '/progress',
      icon: TrendingUp,
    },
    {
      name: 'Timeline',
      href: '/timeline',
      icon: GanttChartSquare,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0',
          isCollapsed ? 'w-16' : 'w-56',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header with Logo Image */}
        <div className="relative flex h-12 items-center justify-between px-3 border-b border-border bg-card">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center overflow-hidden',
              isCollapsed ? 'justify-center w-full' : 'space-x-2'
            )}
            title="ConstructCMS"
          >
            {isCollapsed ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <img
                  src="/logo-icon.png"
                  alt="ConstructCMS Icon"
                  className="h-7 w-7 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center overflow-hidden py-1">
                {/* Light mode logo */}
                <img
                  src="/logo-light.png"
                  alt="ConstructCMS"
                  className="h-7 w-auto block dark:hidden object-contain"
                />
                {/* Dark mode logo */}
                <img
                  src="/logo-dark.png"
                  alt="ConstructCMS"
                  className="h-7 w-auto hidden dark:block object-contain"
                />
              </div>
            )}
          </Link>

          {/* Mobile Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3 top-3 h-5 w-5 items-center justify-center rounded-full bg-[#EA580C] text-white border border-card shadow-sm hover:bg-[#C2410C] hover:scale-105 transition-all z-50 cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  'group flex items-center rounded-md px-2.5 py-2 text-xs font-medium transition-colors',
                  isCollapsed ? 'justify-center' : 'justify-between',
                  isActive
                    ? 'bg-[#FFF7ED] text-[#EA580C] dark:bg-orange-950/40 dark:text-orange-300 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-[#EA580C]' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-tight',
                      item.badgeVariant === 'warning'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Workspace Profile Card & Logout */}
        <div className="p-2 border-t border-border bg-card">
          <div
            className={cn(
              'flex items-center rounded-md p-1.5 text-xs justify-between',
              isCollapsed && 'justify-center'
            )}
            title={`${userName} (${userEmail})`}
          >
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="h-7 w-7 shrink-0 rounded-md bg-[#0F172A] text-[#EA580C] flex items-center justify-center font-bold text-[11px]">
                {getInitials(userName, userEmail)}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden leading-tight">
                  <p className="font-semibold text-xs text-foreground truncate max-w-[100px]">
                    {userName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {userEmail}
                  </p>
                </div>
              )}
            </div>

            {/* Logout icon button */}
            <button
              onClick={() => setLogoutOpen(true)}
              className={cn(
                'p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer',
                isCollapsed && 'hidden'
              )}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
      />
    </>
  );
}
