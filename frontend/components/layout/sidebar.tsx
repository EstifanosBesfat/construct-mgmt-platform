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
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardSummary } from '@/hooks/use-dashboard';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Company & Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-foreground flex items-center">
                CONSTRUCT<span className="text-amber-500">CMS</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                Enterprise Suite
              </p>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Operations & Planning
          </p>
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
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive
                        ? 'text-amber-500'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      isActive ? 'bg-amber-500/20' : 'bg-muted'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Workspace Profile Card */}
        <div className="p-3 border-t border-border m-3 rounded-2xl bg-muted/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold text-xs">
              YM
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">Yonas M.</p>
              <p className="text-[10px] text-muted-foreground flex items-center">
                <ShieldCheck className="h-3 w-3 text-emerald-500 mr-1" />
                Project Manager
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
