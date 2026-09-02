import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 mb-4 border-b border-border/80',
        className
      )}
    >
      <div className="flex items-center space-x-2.5">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {badge}
        {description && (
          <span className="hidden md:inline text-xs text-muted-foreground border-l border-border pl-2.5">
            {description}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
