import { ArrowLeftRight, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../lib/formatters';

export function SettlementSuggestions({ suggestions = [], groupId, members, currentUserId, onSettle }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Suggested Settlements
        </h3>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle}
            title="All settled!"
            subtitle="No pending debts in this group"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {suggestions.map((suggestion, index) => {
            const isPayer = String(currentUserId) === String(suggestion.fromUserId);
            const isReceiver = String(currentUserId) === String(suggestion.toUserId);

            return (
              <Card
                key={`${suggestion.fromUserId}-${suggestion.toUserId}-${index}`}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <ArrowLeftRight className="h-5 w-5 text-accent-light" />
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {suggestion.fromName} pays {suggestion.toName}
                </p>
                <p className="mt-2 font-mono text-xl font-bold text-accent-light">
                  {formatCurrency(suggestion.amount)}
                </p>

                {isPayer && (
                  <>
                    <p className="mt-2 text-xs text-danger">
                      You owe {formatCurrency(suggestion.amount)}
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        onSettle({
                          payerId: suggestion.fromUserId,
                          receiverId: suggestion.toUserId,
                          amount: suggestion.amount,
                        })
                      }
                    >
                      Settle
                    </Button>
                  </>
                )}

                {isReceiver && (
                  <p className="mt-2 text-xs text-success">
                    You will receive {formatCurrency(suggestion.amount)}
                  </p>
                )}

                {!isPayer && !isReceiver && (
                  <p className="mt-2 text-xs text-text-muted">
                    Between other members
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
