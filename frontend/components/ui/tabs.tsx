'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex space-x-1 border-b border-border', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center space-x-2 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-all duration-150 cursor-pointer',
              isActive
                ? 'border-[#EA580C] text-[#EA580C] font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab.icon && <span className="h-3.5 w-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-tight',
                  isActive
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
