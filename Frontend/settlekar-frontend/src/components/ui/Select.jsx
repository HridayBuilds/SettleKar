import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(
  ({ className, label, error, options = [], placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'h-11 w-full rounded-sm border border-border bg-bg-elevated px-3 text-sm text-text-primary transition-colors focus:border-border-focus focus:outline-none appearance-none cursor-pointer',
            error && 'border-danger',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-text-muted">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-elevated text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
