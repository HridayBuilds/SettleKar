import { Link } from 'react-router-dom';
import { Plane, Building2, PartyPopper, Home } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import { formatCurrency } from '../../lib/formatters';
import { GROUP_TYPES, GROUP_TYPE_ICONS } from '../../lib/constants';
import { cn } from '../../lib/utils';

const TYPE_ICON_MAP = {
  Plane: Plane,
  Building2: Building2,
  PartyPopper: PartyPopper,
  Home: Home,
};

export function GroupCard({ group }) {
  const iconName = GROUP_TYPE_ICONS[group.type] || 'Home';
  const IconComponent = TYPE_ICON_MAP[iconName] || Home;
  const balance = group.currentUserBalance ?? 0;

  return (
    <Link to={`/groups/${group.id}`} className="block">
      <Card className="transition-colors hover:border-border-focus">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-bg-elevated">
              <IconComponent className="h-4 w-4 text-accent-light" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              {group.name}
            </h3>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StatusBadge status={group.status} />
          <Badge variant="accent">{GROUP_TYPES[group.type] || group.type}</Badge>
        </div>

        {group.description && (
          <p className="mt-2 truncate text-sm text-text-secondary">
            {group.description}
          </p>
        )}

        <p className="mt-1 text-xs text-text-muted">
          {group.memberCount ?? 0} members
        </p>

        <div className="mt-4 flex items-center justify-end">
          <span
            className={cn(
              'font-mono text-sm font-semibold',
              balance >= 0 ? 'text-success' : 'text-danger'
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
