import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'cat';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#FFF7ED] text-[#C2410C] dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    cat: 'bg-[#EA580C] text-white border-[#C2410C] font-semibold',
    secondary: 'bg-muted text-muted-foreground border-border',
    destructive: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/40',
    outline: 'text-foreground border-border bg-card',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
    warning: 'bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200 dark:border-orange-900/40',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
