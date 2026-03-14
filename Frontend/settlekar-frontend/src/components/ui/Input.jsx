import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(
  ({ className, label, error, icon: Icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'h-11 w-full rounded-sm border border-border bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none',
              Icon && 'pl-10',
              error && 'border-danger',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
