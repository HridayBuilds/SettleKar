import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider',
  {
    variants: {
      variant: {
        active: 'bg-success/15 text-success',
        pending: 'bg-warning/15 text-warning',
        completed: 'bg-success/15 text-success',
        failed: 'bg-danger/15 text-danger',
        locked: 'bg-warning/15 text-warning',
        settled: 'bg-text-muted/15 text-text-muted',
        default: 'bg-text-muted/15 text-text-muted',
        accent: 'bg-accent/15 text-accent-light',
        admin: 'bg-accent/15 text-accent-light',
        member: 'bg-text-muted/15 text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({ variant, className, children }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const variantMap = {
    ACTIVE: 'active',
    LOCKED: 'locked',
    SETTLED: 'settled',
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CREATED: 'pending',
    CAPTURED: 'completed',
    ADMIN: 'admin',
    MEMBER: 'member',
  };

  const labelMap = {
    ACTIVE: 'Active',
    LOCKED: 'Locked',
    SETTLED: 'Settled',
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CREATED: 'Created',
    CAPTURED: 'Captured',
    ADMIN: 'Admin',
    MEMBER: 'Member',
  };

  return (
    <Badge variant={variantMap[status] || 'default'}>
      {labelMap[status] || status}
    </Badge>
  );
}
