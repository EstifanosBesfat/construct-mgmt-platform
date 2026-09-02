'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  Boxes,
  ArrowDownLeft,
  CheckCircle2,
  ExternalLink,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NotificationPopoverProps {
  onOpenStockIn?: () => void;
}

const READ_STORAGE_KEY = 'construct_cms_notifications_read_ids';
const DISMISSED_STORAGE_KEY = 'construct_cms_notifications_dismissed_ids';

export function NotificationPopover({ onOpenStockIn }: NotificationPopoverProps) {
  const router = useRouter();
  const { data: dashboardData } = useDashboardSummary();
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'all' | 'alerts' | 'activity'>('all');
  const [readItemIds, setReadItemIds] = React.useState<Set<string>>(new Set());
  const [dismissedItemIds, setDismissedItemIds] = React.useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Load read and dismissed IDs from localStorage on client mount
  React.useEffect(() => {
    try {
      const savedRead = localStorage.getItem(READ_STORAGE_KEY);
      if (savedRead) {
        setReadItemIds(new Set(JSON.parse(savedRead)));
      }
      const savedDismissed = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (savedDismissed) {
        setDismissedItemIds(new Set(JSON.parse(savedDismissed)));
      }
    } catch {
      // Ignore localStorage parsing errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist read IDs to localStorage
  const persistReadIds = (newSet: Set<string>) => {
    setReadItemIds(newSet);
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
    } catch {
      // Ignore storage quota errors
    }
  };

  // Persist dismissed IDs to localStorage
  const persistDismissedIds = (newSet: Set<string>) => {
    setDismissedItemIds(newSet);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
    } catch {
      // Ignore storage quota errors
    }
  };

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

  // Extract alerts and activities from live backend data
  const lowStockMaterials = (dashboardData?.materialStockSummary ?? []).filter((m) => m.isLowStock);
  const recentProgress = dashboardData?.recentProgress ?? [];
  const recentTransactions = dashboardData?.recentTransactions ?? [];

  // Build unified notification items
  const alertNotifications = lowStockMaterials
    .map((material) => ({
      id: `low-stock-${material.id}`,
      type: 'alert' as const,
      title: `Low Stock: ${material.name}`,
      description: `Current: ${material.currentStock} ${material.unit} (Min safety: ${material.minimumStock} ${material.unit})`,
      time: 'Action Required',
      material,
      href: `/materials?highlight=${material.id}`,
    }))
    .filter((n) => !dismissedItemIds.has(n.id));

  const progressNotifications = recentProgress
    .slice(0, 5)
    .map((p) => ({
      id: `progress-${p.id}`,
      type: 'progress' as const,
      title: `Milestone: ${p.projectName}`,
      description: `${p.description} — Reached ${p.percentage}%`,
      time: formatDate(p.date),
      href: `/projects/${p.projectId}`,
    }))
    .filter((n) => !dismissedItemIds.has(n.id));

  const transactionNotifications = recentTransactions
    .slice(0, 5)
    .map((t) => ({
      id: `tx-${t.id}`,
      type: 'transaction' as const,
      title: `${t.type === 'STOCK_IN' ? 'Stock In Received' : 'Stock Out Issued'}: ${t.materialName}`,
      description: `${t.type === 'STOCK_IN' ? '+' : '-'}${t.quantity} ${t.unit}${
        t.projectName ? ` for ${t.projectName}` : ''
      } (Ref: ${t.reference})`,
      time: formatDate(t.date),
      href: '/inventory',
    }))
    .filter((n) => !dismissedItemIds.has(n.id));

  const allNotifications = [
    ...alertNotifications,
    ...progressNotifications,
    ...transactionNotifications,
  ];

  // Count unread items (excluding dismissed)
  const unreadAlertsCount = isLoaded
    ? alertNotifications.filter((n) => !readItemIds.has(n.id)).length
    : 0;

  const totalUnreadCount = isLoaded
    ? allNotifications.filter((n) => !readItemIds.has(n.id)).length
    : 0;

  const markAllAsRead = () => {
    const updated = new Set([...Array.from(readItemIds), ...allNotifications.map((n) => n.id)]);
    persistReadIds(updated);
  };

  const markAsRead = (id: string) => {
    const updated = new Set([...Array.from(readItemIds), id]);
    persistReadIds(updated);
  };

  const dismissNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedDismissed = new Set([...Array.from(dismissedItemIds), id]);
    persistDismissedIds(updatedDismissed);
  };

  const clearAllNotifications = () => {
    const updatedDismissed = new Set([
      ...Array.from(dismissedItemIds),
      ...allNotifications.map((n) => n.id),
    ]);
    persistDismissedIds(updatedDismissed);
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
        className="relative rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 focus:outline-none h-7 w-7 flex items-center justify-center cursor-pointer"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadAlertsCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EA580C] px-1 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadAlertsCount}
          </span>
        ) : totalUnreadCount > 0 ? (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#EA580C] ring-2 ring-card" />
        ) : null}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 z-50 w-80 sm:w-96 rounded-lg border border-border bg-card shadow-lg p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-foreground">Notifications</span>
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

            <div className="flex items-center space-x-2">
              {totalUnreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-medium text-[#EA580C] hover:text-[#C2410C] flex items-center space-x-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <Check className="h-3 w-3" />
                  <span>Mark read</span>
                </button>
              )}
              {allNotifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] font-medium text-muted-foreground hover:text-red-600 flex items-center space-x-1 cursor-pointer ml-1"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-2.5 pt-1.5 pb-1 border-b border-border bg-muted/10 gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-card text-[#EA580C] font-semibold border border-border shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({allNotifications.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center space-x-1 cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-card text-[#EA580C] font-semibold border border-border shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Low Stock</span>
              {alertNotifications.length > 0 && (
                <span className="h-3.5 w-3.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#EA580C] text-[9px] flex items-center justify-center font-bold">
                  {alertNotifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-card text-[#EA580C] font-semibold border border-border shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity ({progressNotifications.length + transactionNotifications.length})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center px-4">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 mb-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-foreground">All caught up!</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  No pending warnings or unread activities in this category.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isRead = readItemIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`group relative p-2.5 transition-colors hover:bg-muted/50 flex items-start space-x-2.5 ${
                      !isRead ? 'bg-orange-500/5' : ''
                    }`}
                  >
                    {/* Icon Column */}
                    <div className="mt-0.5 flex-shrink-0">
                      {item.type === 'alert' && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] border border-orange-200 dark:border-orange-800">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {item.type === 'progress' && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {item.type === 'transaction' && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                          <Boxes className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        {item.type === 'alert' && onOpenStockIn && (
                          <button
                            onClick={() => {
                              markAsRead(item.id);
                              setIsOpen(false);
                              onOpenStockIn();
                            }}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EA580C] text-white hover:bg-[#C2410C] transition-colors shadow-xs cursor-pointer"
                          >
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                            Stock In
                          </button>
                        )}
                        <button
                          onClick={() => {
                            markAsRead(item.id);
                            setIsOpen(false);
                            router.push(item.href);
                          }}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border border-border"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-70" />
                        </button>
                      </div>
                    </div>

                    {/* Right side: Delete/Dismiss button and unread dot */}
                    <div className="flex flex-col items-center space-y-1.5 shrink-0">
                      <button
                        onClick={(e) => dismissNotification(item.id, e)}
                        className="opacity-60 hover:opacity-100 hover:text-red-600 rounded p-0.5 transition-opacity cursor-pointer"
                        title="Delete notification"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {!isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C] shrink-0" />
                      )}
                    </div>
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
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
            >
              Materials Catalogue →
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/inventory');
              }}
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
            >
              Transaction Log →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
