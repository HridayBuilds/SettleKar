import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../lib/formatters';
import { cn } from '../../lib/utils';

export function MemberBreakdownTable({
  members = [],
  splitMethod,
  totalAmount,
  shares = [],
  onChange,
}) {
  const total = Number(totalAmount) || 0;

  const getShareValue = (userId, field) => {
    const share = shares.find((s) => s.userId === userId);
    if (!share) return 0;
    return share[field] ?? 0;
  };

  const handleShareChange = (userId, field, rawValue) => {
    const value = parseFloat(rawValue) || 0;
    const updated = shares.map((s) => {
      if (s.userId !== userId) return s;
      if (field === 'sharePercentage') {
        return { ...s, sharePercentage: value, shareAmount: (total * value) / 100 };
      }
      return { ...s, shareAmount: value };
    });
    onChange?.(updated);
  };

  // Validation
  const currentSum =
    splitMethod === 'PERCENTAGE'
      ? shares.reduce((sum, s) => sum + (s.sharePercentage ?? 0), 0)
      : shares.reduce((sum, s) => sum + (s.shareAmount ?? 0), 0);

  const expectedTotal = splitMethod === 'PERCENTAGE' ? 100 : total;
  const isValid = Math.abs(currentSum - expectedTotal) < 0.01;

  return (
    <div>
      {/* Validation header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Member Shares
        </span>
        <span
          className={cn(
            'font-mono text-xs font-medium',
            isValid ? 'text-success' : 'text-danger'
          )}
        >
          Total: {splitMethod === 'PERCENTAGE'
            ? `${currentSum.toFixed(1)}% / 100%`
            : `${formatCurrency(currentSum)} / ${formatCurrency(expectedTotal)}`}
        </span>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const userId = member.userId || member.id;
          const equalShare =
            members.length > 0
              ? Math.round((total / members.length) * 100) / 100
              : 0;

          return (
            <div
              key={userId}
              className="flex items-center gap-3 rounded-sm border border-border bg-bg-card px-3 py-2"
            >
              <Avatar
                firstName={member.firstName}
                lastName={member.lastName}
                size="sm"
              />
              <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                {member.firstName} {member.lastName}
              </span>

              {splitMethod === 'EQUAL' && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={formatCurrency(equalShare)}
                    className="h-8 w-28 rounded-sm border border-border bg-bg-elevated px-2 text-right font-mono text-sm text-text-secondary"
                  />
                </div>
              )}

              {splitMethod === 'PERCENTAGE' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getShareValue(userId, 'sharePercentage')}
                    onChange={(e) =>
                      handleShareChange(userId, 'sharePercentage', e.target.value)
                    }
                    className="h-8 w-20 rounded-sm border border-border bg-bg-elevated px-2 text-right font-mono text-sm text-text-primary focus:border-border-focus focus:outline-none"
                  />
                  <span className="text-xs text-text-muted">%</span>
                  <span className="w-24 text-right font-mono text-xs text-text-secondary">
                    {formatCurrency((total * getShareValue(userId, 'sharePercentage')) / 100)}
                  </span>
                </div>
              )}

              {splitMethod === 'CUSTOM' && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-text-muted">INR</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={getShareValue(userId, 'shareAmount')}
                    onChange={(e) =>
                      handleShareChange(userId, 'shareAmount', e.target.value)
                    }
                    className="h-8 w-28 rounded-sm border border-border bg-bg-elevated px-2 text-right font-mono text-sm text-text-primary focus:border-border-focus focus:outline-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
