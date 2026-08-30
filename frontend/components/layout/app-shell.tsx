'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';

const SIDEBAR_COLLAPSED_KEY = 'cms-sidebar-collapsed';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [stockInOpen, setStockInOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true') {
        setCollapsed(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const handleToggleSidebar = React.useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      toggleCollapsed();
      return;
    }
    setMobileOpen((open) => !open);
  }, [toggleCollapsed]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        isOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggle={handleToggleSidebar}
      />

      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={collapsed}
          onOpenStockIn={() => setStockInOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:px-6 lg:py-4 w-full animate-fade-in">
          {children}
        </main>
      </div>

      <StockInDialog
        isOpen={stockInOpen}
        onClose={() => setStockInOpen(false)}
      />
    </div>
  );
}
