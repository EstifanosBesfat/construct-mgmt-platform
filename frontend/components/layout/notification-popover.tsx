'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Check,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NotificationPopoverProps {
  onOpenStockIn?: () => void;
}

export function NotificationPopover({ onOpenStockIn }: NotificationPopoverProps) {
  const router = useRouter();
  const { data: dashboardData } = useDashboardSummary();
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'all' | 'alerts' | 'activity'>('all');
  const [readItemIds, setReadItemIds] = React.useState<Set<string>>(new Set());
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Extract alerts and activities
  const lowStockMaterials = (dashboardData?.materialStockSummary ?? []).filter((m) => m.isLowStock);
  const recentProgress = dashboardData?.recentProgress ?? [];
  const recentTransactions = dashboardData?.recentTransactions ?? [];

  // Build unified notification items
  const alertNotifications = lowStockMaterials.map((material) => ({
    id: `low-stock-${material.id}`,
    type: 'alert' as const,
    title: `Low Stock: ${material.name}`,
    description: `Current: ${material.currentStock} ${material.unit} (Min safety: ${material.minimumStock} ${material.unit})`,
    time: 'Action Required',
    material,
    href: '/materials',
  }));

  const progressNotifications = recentProgress.slice(0, 4).map((p) => ({
    id: `progress-${p.id}`,
    type: 'progress' as const,
    title: `Milestone: ${p.projectName}`,
    description: `${p.description} — Reached ${p.percentage}%`,
    time: formatDate(p.date),
    href: `/projects/${p.projectId}`,
  }));

  const transactionNotifications = recentTransactions.slice(0, 4).map((t) => ({
    id: `tx-${t.id}`,
    type: 'transaction' as const,
    title: `${t.type === 'STOCK_IN' ? 'Stock In Received' : 'Stock Out Issued'}: ${t.materialName}`,
    description: `${t.type === 'STOCK_IN' ? '+' : '-'}${t.quantity} ${t.unit}${
      t.projectName ? ` for ${t.projectName}` : ''
    } (Ref: ${t.reference})`,
    time: formatDate(t.date),
    href: '/inventory',
  }));

  const allNotifications = [
    ...alertNotifications,
    ...progressNotifications,
    ...transactionNotifications,
  ];

  const unreadAlertsCount = alertNotifications.filter((n) => !readItemIds.has(n.id)).length;
  const totalUnreadCount = allNotifications.filter((n) => !readItemIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(allNotifications.map((n) => n.id));
    setReadItemIds(allIds);
  };

  const markAsRead = (id: string) => {
    setReadItemIds((prev) => new Set([...Array.from(prev), id]));
  };

  const filteredItems = React.useMemo(() => {
    if (activeTab === 'alerts') return alertNotifications;
    if (activeTab === 'activity') return [...progressNotifications, ...transactionNotifications];
    return allNotifications;
  }, [activeTab, alertNotifications, progressNotifications, transactionNotifications]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        {unreadAlertsCount > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-slate-950 shadow-sm animate-pulse">
            {unreadAlertsCount}
          </span>
        ) : totalUnreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-background" />
        ) : null}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadAlertsCount > 0 ? (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  {unreadAlertsCount} {unreadAlertsCount === 1 ? 'Alert' : 'Alerts'}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  Up to date
                </Badge>
              )}
            </div>

            {totalUnreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center space-x-1"
              >
                <Check className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-3 pt-2 pb-1 border-b border-border bg-muted/10 gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({allNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                activeTab === 'alerts'
                  ? 'bg-background text-sky-500 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Low Stock</span>
              {alertNotifications.length > 0 && (
                <span className="h-4 w-4 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] flex items-center justify-center font-bold">
                  {alertNotifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'activity'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity ({progressNotifications.length + transactionNotifications.length})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {filteredItems.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-foreground">All caught up!</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  No pending warnings or unread activities in this category.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isRead = readItemIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`group relative p-3.5 transition-colors hover:bg-muted/50 flex items-start space-x-3 ${
                      !isRead ? 'bg-sky-500/[0.03]' : ''
                    }`}
                  >
                    {/* Icon Column */}
                    <div className="mt-0.5 flex-shrink-0">
                      {item.type === 'alert' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 border border-sky-500/30">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                      {item.type === 'progress' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                      )}
                      {item.type === 'transaction' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          <Boxes className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="mt-2 flex items-center space-x-2">
                        {item.type === 'alert' && onOpenStockIn && (
                          <button
                            onClick={() => {
                              markAsRead(item.id);
                              setIsOpen(false);
                              onOpenStockIn();
                            }}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors shadow-sm"
                          >
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                            Stock-In
                          </button>
                        )}
                        <button
                          onClick={() => {
                            markAsRead(item.id);
                            setIsOpen(false);
                            router.push(item.href);
                          }}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-70" />
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator dot */}
                    {!isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/materials');
              }}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            >
              Materials Catalogue →
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/inventory');
              }}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            >
              Transaction Log →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
