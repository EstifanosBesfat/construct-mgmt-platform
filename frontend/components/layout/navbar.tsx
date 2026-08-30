'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import {
  Menu,
  Moon,
  Sun,
  Search,
  Plus,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandMenu } from '@/components/layout/command-menu';
import { NotificationPopover } from '@/components/layout/notification-popover';
import { useRouter } from 'next/navigation';
import { useDashboardSummary } from '@/hooks/use-dashboard';

interface NavbarProps {
  onOpenSidebar?: () => void;
  onOpenNewProject?: () => void;
  onOpenStockIn?: () => void;
  onOpenStockOut?: () => void;
  onOpenLogProgress?: () => void;
}

export function Navbar({
  onOpenSidebar,
  onOpenNewProject,
  onOpenStockIn,
  onOpenStockOut,
  onOpenLogProgress,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { data: dashboardData } = useDashboardSummary();
  const router = useRouter();

  const lowStockCount = dashboardData?.inventory?.lowStockCount ?? 0;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
        {/* Left: Mobile Menu + Search Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Open Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Quick Global Search Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center space-x-3 rounded-xl border border-input bg-background/60 px-3.5 py-1.5 text-xs text-muted-foreground hover:border-sky-500/40 hover:text-foreground transition-all w-64 md:w-80"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 text-left">Search projects, materials, codes...</span>
            <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium font-mono text-muted-foreground">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Theme Toggle & Quick Add */}
        <div className="flex items-center space-x-2.5">
          {/* Notifications Popover */}
          <NotificationPopover onOpenStockIn={onOpenStockIn} />

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl text-muted-foreground hover:text-foreground"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <Button
              variant="amber"
              size="sm"
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="rounded-xl space-x-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Action</span>
            </Button>

            {isQuickActionOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuickActionOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl animate-fade-in">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quick Actions
                  </p>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenNewProject) onOpenNewProject();
                      else router.push('/projects/new');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-muted text-foreground transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-sky-500" />
                    <span>Create New Project</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenStockIn) onOpenStockIn();
                      else router.push('/inventory');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-muted text-foreground transition-colors"
                  >
                    <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                    <span>Record Stock-In</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenStockOut) onOpenStockOut();
                      else router.push('/inventory');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-muted text-foreground transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4 text-rose-500" />
                    <span>Record Stock-Out</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenLogProgress) onOpenLogProgress();
                      else router.push('/progress');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-muted text-foreground transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span>Log Milestone Progress</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}
