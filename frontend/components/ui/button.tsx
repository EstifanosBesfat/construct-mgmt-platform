import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'amber' | 'pill';
  size?: 'default' | 'sm' | 'xs' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-[#EA580C] text-white font-medium hover:bg-[#C2410C] border border-[#C2410C] shadow-xs',
      amber: 'bg-[#EA580C] text-white font-medium hover:bg-[#C2410C] border border-[#C2410C] shadow-xs',
      outline: 'border border-border bg-card text-foreground hover:bg-muted hover:text-foreground shadow-xs',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-muted hover:text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs',
      pill: 'border border-border bg-background text-muted-foreground hover:border-[#EA580C] hover:text-foreground rounded-full',
    };

    const sizes = {
      default: 'h-8 px-3 py-1.5 text-xs',
      sm: 'h-7 rounded-md px-2.5 text-xs',
      xs: 'h-6 rounded-md px-2 text-[11px]',
      lg: 'h-9 rounded-md px-4 text-sm',
      icon: 'h-7 w-7 p-0 flex items-center justify-center rounded-md',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
