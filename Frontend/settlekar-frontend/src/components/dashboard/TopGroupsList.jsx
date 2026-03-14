import { Link } from 'react-router-dom';
import { Plane, Building2, PartyPopper, Home } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';
import { cn } from '../../lib/utils';

const TYPE_ICON_MAP = {
  Plane: Plane,
  Building2: Building2,
  PartyPopper: PartyPopper,
  Home: Home,
};

const GROUP_TYPE_ICONS = {
  TRAVEL: 'Plane',
  HOSTEL: 'Building2',
  EVENT: 'PartyPopper',
  FAMILY: 'Home',
};

export function TopGroupsList({ groups = [] }) {
  const displayed = groups.slice(0, 5);

  return (
    <Card className="flex h-full flex-col">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Top Groups
      </h3>

      {displayed.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No groups yet
        </p>
      ) : (
        <ul className="flex-1 space-y-1">
          {displayed.map((group) => {
            const iconName = GROUP_TYPE_ICONS[group.type] || 'Home';
            const IconComponent = TYPE_ICON_MAP[iconName] || Home;
            const balance = group.currentUserBalance ?? 0;

            return (
              <li key={group.id}>
                <Link
                  to={`/groups/${group.id}`}
                  className="flex items-center gap-3 rounded-sm px-2 py-2.5 transition-colors hover:bg-bg-elevated"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-bg-elevated">
                    <IconComponent className="h-4 w-4 text-accent-light" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {group.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {group.memberCount ?? 0} members
                    </p>
                  </div>

                  <span
                    className={cn(
                      'font-mono text-sm font-medium',
                      balance >= 0 ? 'text-success' : 'text-danger'
                    )}
                  >
                    {formatCurrency(balance)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
