import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outline' | 'gradient-border';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-surface-200/80 shadow-sm',
      glass: 'glass-card border border-white/60 shadow-glass',
      elevated: 'bg-white border border-surface-100 shadow-premium',
      outline: 'bg-transparent border border-surface-200',
      'gradient-border':
        'relative bg-white p-[1px] rounded-2xl before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-r before:from-brand-500 before:to-accent-cyan before:p-[1px]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 transition-all duration-300',
          variants[variant],
          interactive && 'hover:-translate-y-1 hover:shadow-glass-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-xl font-bold tracking-tight text-surface-900', className)}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-surface-500 leading-relaxed', className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('pt-0', className)} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center pt-4 border-t border-surface-100', className)} {...props} />
);
