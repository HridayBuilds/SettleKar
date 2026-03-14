import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-bg-card p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
