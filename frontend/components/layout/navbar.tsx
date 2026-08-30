'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Menu, Moon, Sun, Search, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandMenu } from '@/components/layout/command-menu';
import { NotificationPopover } from '@/components/layout/notification-popover';

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onOpenStockIn?: () => void;
}

export function Navbar({
  onToggleSidebar,
  sidebarCollapsed,
  onOpenStockIn,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4 hidden lg:block" />
            ) : (
              <Menu className="h-4 w-4 hidden lg:block" />
            )}
            <Menu className="h-5 w-5 lg:hidden" />
          </button>

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

        <div className="flex items-center space-x-2.5">
          <NotificationPopover onOpenStockIn={onOpenStockIn} />

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
        </div>
      </header>

      <CommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}
