'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Menu,
  Moon,
  Sun,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandMenu } from '@/components/layout/command-menu';
import { NotificationPopover } from '@/components/layout/notification-popover';

interface NavbarProps {
  onOpenSidebar?: () => void;
  onOpenStockIn?: () => void;
}

export function Navbar({ onOpenSidebar, onOpenStockIn }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbMap: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    materials: 'Materials Catalogue',
    inventory: 'Inventory Movements',
    progress: 'Milestone Progress',
    timeline: 'Project Timeline',
    new: 'New Project',
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-border bg-card px-3 sm:px-4 shadow-2xs">
        {/* Left: Mobile Menu + Breadcrumbs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors font-medium"
            >
              ConstructCMS
            </Link>
            {pathSegments.map((segment, index) => {
              const href = '/' + pathSegments.slice(0, index + 1).join('/');
              const isLast = index === pathSegments.length - 1;
              const title = breadcrumbMap[segment] || (segment.startsWith('cmt') ? 'Project Details' : segment);

              return (
                <React.Fragment key={href}>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  {isLast ? (
                    <span className="font-semibold text-foreground">{title}</span>
                  ) : (
                    <Link
                      href={href}
                      className="hover:text-foreground transition-colors"
                    >
                      {title}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Search, Notifications, Theme */}
        <div className="flex items-center space-x-2">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center space-x-2 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground hover:border-[#EA580C] hover:text-foreground transition-colors h-7 cursor-pointer"
            title="Search projects, materials, and actions (Ctrl+K)"
          >
            <Search className="h-3 w-3" />
            <span className="hidden sm:inline text-[11px]">Quick Search...</span>
            <kbd className="hidden sm:inline rounded bg-muted px-1 text-[10px] font-mono text-muted-foreground">
              Ctrl+K
            </kbd>
          </button>

          {/* Notification Popover */}
          <NotificationPopover onOpenStockIn={onOpenStockIn} />

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-md text-muted-foreground hover:text-foreground h-7 w-7 cursor-pointer"
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-orange-400" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
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
