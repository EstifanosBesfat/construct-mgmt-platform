import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorColor?: string;
  showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorColor, showLabel, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    const getColor = (pct: number) => {
      if (indicatorColor) return indicatorColor;
      if (pct >= 100) return 'bg-emerald-500';
      if (pct >= 70) return 'bg-amber-500';
      if (pct >= 30) return 'bg-blue-500';
      return 'bg-slate-400';
    };

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span className="font-semibold text-foreground">{percentage.toFixed(0)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            'relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/80',
            className
          )}
          {...props}
        >
          <div
            className={cn('h-full transition-all duration-500 ease-out rounded-full', getColor(percentage))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
