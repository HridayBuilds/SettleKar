import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../lib/formatters';

export function PairwiseBalanceList({ balances = [] }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Outstanding Balances
      </h3>

      {balances.length === 0 ? (
        <EmptyState
          icon={ArrowRight}
          title="No outstanding balances"
          subtitle="All debts are settled in this group"
        />
      ) : (
        <div className="space-y-3">
          {balances.map((pair, index) => (
            <div
              key={`${pair.fromUserId}-${pair.toUserId}-${index}`}
              className="flex items-center gap-3 rounded-sm border border-border bg-bg-elevated px-4 py-3"
            >
              <Avatar
                firstName={pair.fromName?.split(' ')[0]}
                lastName={pair.fromName?.split(' ').slice(1).join(' ')}
                size="sm"
              />
              <span className="text-sm font-medium text-text-primary">
                {pair.fromName}
              </span>

              <ArrowRight className="h-4 w-4 flex-shrink-0 text-text-muted" />

              <Avatar
                firstName={pair.toName?.split(' ')[0]}
                lastName={pair.toName?.split(' ').slice(1).join(' ')}
                size="sm"
              />
              <span className="text-sm font-medium text-text-primary">
                {pair.toName}
              </span>

              <span className="ml-auto font-mono text-sm font-semibold text-accent-light">
                {formatCurrency(pair.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
