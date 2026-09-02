'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { ProgressFormDialog } from '@/components/progress/progress-form-dialog';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [stockInOpen, setStockInOpen] = React.useState(false);
  const [stockOutOpen, setStockOutOpen] = React.useState(false);
  const [logProgressOpen, setLogProgressOpen] = React.useState(false);

  // Load sidebar collapse preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('cms_sidebar_collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cms_sidebar_collapsed', String(next));
      return next;
    });
  };

  const isPublicPage = pathname === '/' || pathname === '/login';

  // Client-side authentication enforcement
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (isPublicPage) {
      setIsAuthenticated(true);
      return;
    }

    const isLoggedIn = localStorage.getItem('cms_logged_in') === 'true';
    const hasAuthCookie = document.cookie.includes('cms_auth_session=');

    if (!isLoggedIn && !hasAuthCookie) {
      setIsAuthenticated(false);
      window.location.href = '/?auth=signin';
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  // Prevent UI flash on direct link access before auth check finishes
  if (isAuthenticated === false || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground text-xs font-medium">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-6 w-6 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
          <p>Verifying secure workspace session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenStockIn={() => setStockInOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-5 max-w-[1600px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <ProjectFormDialog
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
      <StockInDialog
        isOpen={stockInOpen}
        onClose={() => setStockInOpen(false)}
      />
      <StockOutDialog
        isOpen={stockOutOpen}
        onClose={() => setStockOutOpen(false)}
      />
      <ProgressFormDialog
        isOpen={logProgressOpen}
        onClose={() => setLogProgressOpen(false)}
      />
    </div>
  );
}
