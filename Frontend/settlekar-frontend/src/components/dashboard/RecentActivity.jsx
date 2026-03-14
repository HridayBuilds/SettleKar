import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { formatRelativeTime } from '../../lib/formatters';
import { cn } from '../../lib/utils';

const DOT_COLORS = {
  EXPENSE_ADDED: 'bg-accent-light',
  EXPENSE_UPDATED: 'bg-accent-light',
  EXPENSE_DELETED: 'bg-accent-light',
  SETTLEMENT_CREATED: 'bg-success',
  SETTLEMENT_COMPLETED: 'bg-success',
  SETTLEMENT_FAILED: 'bg-danger',
  GROUP_CREATED: 'bg-warning',
  MEMBER_JOINED: 'bg-warning',
  MEMBER_LEFT: 'bg-warning',
  GROUP_LOCKED: 'bg-warning',
  GROUP_SETTLED: 'bg-warning',
  RECURRING_EXPENSE_GENERATED: 'bg-accent-light',
  REMINDER_SENT: 'bg-warning',
};

function getDotColor(entryType) {
  return DOT_COLORS[entryType] || 'bg-text-muted';
}

export function RecentActivity({ activities = [] }) {
  const displayed = activities.slice(0, 8);

  return (
    <Card className="flex h-full flex-col">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Recent Activity
      </h3>

      {displayed.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No recent activity
        </p>
      ) : (
        <ul className="flex-1 space-y-3">
          {displayed.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
                  getDotColor(activity.entryType)
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary leading-snug">
                  {activity.description}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {activity.performedByName} -- {formatRelativeTime(activity.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <Link
          to="/activity"
          className="text-xs font-medium text-accent-light hover:text-accent transition-colors"
        >
          View All
        </Link>
      </div>
    </Card>
  );
}
