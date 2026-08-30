'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Boxes,
  ArrowLeftRight,
  TrendingUp,
  GanttChartSquare,
  HardHat,
  AlertTriangle,
  X,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardSummary } from '@/hooks/use-dashboard';

interface SidebarProps {
  isOpen?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export function Sidebar({ isOpen, collapsed = false, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: dashboardData } = useDashboardSummary();
  const lowStockCount = dashboardData?.inventory?.lowStockCount ?? 0;
  const ongoingProjects = dashboardData?.projects?.ongoing ?? 0;

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
      badge: ongoingProjects > 0 ? `${ongoingProjects} active` : undefined,
      alert: false,
    },
    {
      name: 'Materials Catalogue',
      href: '/materials',
      icon: Boxes,
      badge: lowStockCount > 0 ? (
        <span className="flex items-center text-amber-500 font-bold">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {lowStockCount}
        </span>
      ) : undefined,
      alert: lowStockCount > 0,
    },
    {
      name: 'Inventory Movements',
      href: '/inventory',
      icon: ArrowLeftRight,
    },
    {
      name: 'Milestone Progress',
      href: '/progress',
      icon: TrendingUp,
    },
    {
      name: 'Project Timeline',
      href: '/timeline',
      icon: GanttChartSquare,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/95 backdrop-blur-md transition-[width,transform] duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-60 lg:w-14' : 'w-60'
        )}
      >
        <div
          className={cn(
            'flex h-12 items-center border-b border-border',
            collapsed ? 'justify-center px-1' : 'justify-between px-4'
          )}
        >
          <Link href="/dashboard" className="flex items-center space-x-2 group min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/20">
              <HardHat className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-semibold text-sm tracking-tight text-foreground flex items-center">
                  Construct<span className="text-sky-600">CMS</span>
                </span>
                <p className="text-[10px] text-muted-foreground leading-none">
                  Construction manager
                </p>
              </div>
            )}
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className={cn('flex-1 overflow-y-auto py-3 space-y-0.5', collapsed ? 'px-1.5' : 'px-3')}>
          {!collapsed && (
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Operations
            </p>
          )}
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
                title={collapsed ? item.name : undefined}
                className={cn(
                  'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                  collapsed ? 'justify-center h-10 w-10 mx-auto' : 'justify-between px-2.5 py-2',
                  isActive
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/30 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className={cn('flex items-center', collapsed ? '' : 'space-x-3')}>
                  <span className="relative">
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive
                          ? 'text-sky-500'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {collapsed && item.badge && (
                      <span
                        className={cn(
                          'absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full',
                          item.alert ? 'bg-amber-500' : 'bg-sky-500'
                        )}
                      />
                    )}
                  </span>
                  {!collapsed && <span>{item.name}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      isActive ? 'bg-sky-500/20' : 'bg-muted'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className={cn('border-t border-border', collapsed ? 'p-1.5' : 'p-2 m-2 rounded-xl bg-muted/40')}>
          {!collapsed ? (
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-semibold text-xs shrink-0">
                  YM
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">Yonas M.</p>
                  <p className="text-[10px] text-muted-foreground flex items-center">
                    <ShieldCheck className="h-3 w-3 text-emerald-500 mr-1" />
                    Project Manager
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggle}
                className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className="hidden lg:flex h-10 w-10 mx-auto items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
