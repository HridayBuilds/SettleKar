import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';

export function MemberContributions({ data = [] }) {
  const maxAmount = Math.max(
    ...data.map((m) => Math.max(m.totalPaid || 0, m.totalOwed || 0)),
    1
  );

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Member Contributions
      </h3>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No member data available
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((member) => {
            const paidWidth = maxAmount > 0
              ? ((member.totalPaid || 0) / maxAmount) * 100
              : 0;
            const owedWidth = maxAmount > 0
              ? ((member.totalOwed || 0) / maxAmount) * 100
              : 0;

            return (
              <div key={member.memberName}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {member.memberName}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-right text-[11px] font-medium text-success">
                      Paid
                    </span>
                    <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-bg-elevated">
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm bg-accent"
                        style={{ width: `${Math.min(paidWidth, 100)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-mono text-xs text-success">
                      {formatCurrency(member.totalPaid)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-12 text-right text-[11px] font-medium text-danger">
                      Owed
                    </span>
                    <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-bg-elevated">
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm bg-danger"
                        style={{ width: `${Math.min(owedWidth, 100)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-mono text-xs text-danger">
                      {formatCurrency(member.totalOwed)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
