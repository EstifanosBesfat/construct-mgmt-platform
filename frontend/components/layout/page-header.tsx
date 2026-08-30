import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
  backHref,
  backLabel = 'Back',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-border/60',
        className
      )}
    >
      <div className="min-w-0 space-y-0.5">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center text-[11px] font-medium text-muted-foreground hover:text-sky-600 mb-0.5"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            {backLabel}
          </Link>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
