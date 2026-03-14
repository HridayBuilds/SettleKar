import {
  Receipt,
  ArrowLeftRight,
  Users,
  UserPlus,
  UserMinus,
  FileText,
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/formatters';
import { cn } from '../../lib/utils';

const ICON_MAP = {
  EXPENSE_ADDED: { icon: Receipt, color: 'text-accent-light', bg: 'bg-accent/10' },
  EXPENSE_UPDATED: { icon: Receipt, color: 'text-accent-light', bg: 'bg-accent/10' },
  EXPENSE_DELETED: { icon: Receipt, color: 'text-accent-light', bg: 'bg-accent/10' },
  SETTLEMENT_CREATED: { icon: ArrowLeftRight, color: 'text-success', bg: 'bg-success/10' },
  SETTLEMENT_COMPLETED: { icon: ArrowLeftRight, color: 'text-success', bg: 'bg-success/10' },
  SETTLEMENT_FAILED: { icon: ArrowLeftRight, color: 'text-danger', bg: 'bg-danger/10' },
  GROUP_CREATED: { icon: Users, color: 'text-warning', bg: 'bg-warning/10' },
  GROUP_LOCKED: { icon: Users, color: 'text-warning', bg: 'bg-warning/10' },
  GROUP_SETTLED: { icon: Users, color: 'text-warning', bg: 'bg-warning/10' },
  MEMBER_JOINED: { icon: UserPlus, color: 'text-success', bg: 'bg-success/10' },
  MEMBER_LEFT: { icon: UserMinus, color: 'text-danger', bg: 'bg-danger/10' },
  RECURRING_EXPENSE_GENERATED: { icon: Receipt, color: 'text-accent-light', bg: 'bg-accent/10' },
  REMINDER_SENT: { icon: FileText, color: 'text-warning', bg: 'bg-warning/10' },
};

export function ActivityCard({ entry }) {
  const config = ICON_MAP[entry.entryType] || {
    icon: FileText,
    color: 'text-text-muted',
    bg: 'bg-bg-elevated',
  };
  const IconComponent = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-sm border border-border bg-bg-card px-4 py-3">
      <div
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
          config.bg
        )}
      >
        <IconComponent className={cn('h-4 w-4', config.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary">
          {entry.performedByName && (
            <span className="font-semibold">{entry.performedByName}</span>
          )}{' '}
          {entry.description}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          {formatRelativeTime(entry.createdAt)}
        </p>
      </div>
    </div>
  );
}
