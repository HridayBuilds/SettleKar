import { Plus, Settings, Lock, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/formatters';

export function GroupHeader({
  group,
  memberCount,
  onAddExpense,
  onSettings,
  totalExpenses,
}) {
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  const isActive = group.status === 'ACTIVE';

  const handleCopyJoinCode = () => {
    if (group.joinCode) {
      navigator.clipboard?.writeText(group.joinCode);
      setCopied(true);
      toast.success('Join code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Top right actions */}
      {onSettings && (
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            icon={Settings}
          >
            Settings
          </Button>
        </div>
      )}

      {/* Group title */}
      <h1 className="text-2xl font-bold text-text-primary">{group.name}</h1>

      {group.description && (
        <p className="mt-1 text-sm text-text-secondary">{group.description}</p>
      )}

      {/* Stats line */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StatusBadge status={group.status} />
        <span className="text-sm text-text-muted">
          {memberCount ?? 0} Members -- Total Expenses:{' '}
          <span className="font-mono">
            {formatCurrency(totalExpenses ?? 0)}
          </span>
        </span>
      </div>

      {/* Join code */}
      {group.joinCode && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-text-muted">Join Code:</span>
          <code className="rounded bg-bg-elevated px-2 py-1 font-mono text-sm font-semibold text-accent tracking-wider">
            {group.joinCode}
          </code>
          <button
            onClick={handleCopyJoinCode}
            className="text-text-muted hover:text-accent transition-colors"
            title="Copy join code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {/* Add Expense button */}
      <div className="mt-5 flex justify-center">
        {isActive ? (
          <Button onClick={onAddExpense} icon={Plus}>
            Add New Expense
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-sm bg-bg-elevated px-4 py-2 text-sm text-text-muted">
            <Lock className="h-4 w-4" />
            This group is {group.status?.toLowerCase()}. New expenses cannot be added.
          </div>
        )}
      </div>
    </div>
  );
}
