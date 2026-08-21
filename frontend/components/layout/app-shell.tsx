'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { StockInDialog } from '@/components/inventory/stock-in-dialog';
import { StockOutDialog } from '@/components/inventory/stock-out-dialog';
import { ProgressFormDialog } from '@/components/progress/progress-form-dialog';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [stockInOpen, setStockInOpen] = React.useState(false);
  const [stockOutOpen, setStockOutOpen] = React.useState(false);
  const [logProgressOpen, setLogProgressOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewProject={() => setNewProjectOpen(true)}
          onOpenStockIn={() => setStockInOpen(true)}
          onOpenStockOut={() => setStockOutOpen(true)}
          onOpenLogProgress={() => setLogProgressOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
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
