import { Plane, Building2, PartyPopper, Home } from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency } from '../../lib/formatters';
import { cn } from '../../lib/utils';

const TYPE_ICONS = {
  TRAVEL: Plane,
  HOSTEL: Building2,
  EVENT: PartyPopper,
  FAMILY: Home,
};

export function GroupComparison({ groups = [] }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Group Overview
      </h3>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No groups available
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const TypeIcon = TYPE_ICONS[group.type] || Home;
            const balance = group.currentUserBalance ?? 0;
            const isPositive = balance >= 0;

            return (
              <div
                key={group.id}
                className="flex items-center gap-3 rounded-sm border border-border bg-bg-elevated px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent/10">
                  <TypeIcon className="h-4 w-4 text-accent-light" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {group.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {group.memberCount || group.members?.length || 0} member{(group.memberCount || group.members?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>

                <StatusBadge status={group.status} />

                <span
                  className={cn(
                    'min-w-[80px] text-right font-mono text-sm font-semibold',
                    isPositive ? 'text-success' : 'text-danger'
                  )}
                >
                  {formatCurrency(Math.abs(balance))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
