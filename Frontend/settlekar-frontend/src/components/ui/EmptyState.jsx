import { cn } from '../../lib/utils';
import { Button } from './Button';

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated">
          <Icon className="h-8 w-8 text-text-muted" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {subtitle && (
        <p className="mt-1 max-w-sm text-sm text-text-secondary">{subtitle}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
