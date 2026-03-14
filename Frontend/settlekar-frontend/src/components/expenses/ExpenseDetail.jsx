import {
  Utensils,
  Car,
  Hotel,
  Gamepad2,
  Zap,
  ShoppingBag,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { EXPENSE_CATEGORIES, SPLIT_METHODS } from '../../lib/constants';

const CATEGORY_ICONS = {
  FOOD: Utensils,
  TRANSPORT: Car,
  ACCOMMODATION: Hotel,
  ENTERTAINMENT: Gamepad2,
  UTILITIES: Zap,
  SHOPPING: ShoppingBag,
  HEALTH: Heart,
  EDUCATION: GraduationCap,
  OTHER: MoreHorizontal,
};

export function ExpenseDetail({ expense, onEdit, onDelete, onClose }) {
  if (!expense) return null;

  const CategoryIcon = CATEGORY_ICONS[expense.category] || MoreHorizontal;
  const categoryLabel = EXPENSE_CATEGORIES[expense.category]?.label || expense.category;

  return (
    <Card>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {expense.description}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {formatDate(expense.createdAt)}
          </p>
        </div>
        <p className="font-mono text-2xl font-bold text-text-primary">
          {formatCurrency(expense.amount)}
        </p>
      </div>

      {/* Details */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <CategoryIcon className="h-4 w-4 text-text-muted" />
          <Badge variant="accent">{categoryLabel}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Paid by
          </span>
          <Avatar
            firstName={expense.paidByFirstName || expense.paidByName?.split(' ')[0]}
            lastName={expense.paidByLastName || expense.paidByName?.split(' ')[1]}
            size="sm"
          />
          <span className="text-sm text-text-primary">
            {expense.paidByName || `${expense.paidByFirstName || ''} ${expense.paidByLastName || ''}`.trim()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Split Method
          </span>
          <span className="text-sm text-text-secondary">
            {SPLIT_METHODS[expense.splitMethod] || expense.splitMethod}
          </span>
        </div>
      </div>

      {/* Share Breakdown */}
      {expense.shares?.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            Share Breakdown
          </h4>
          <div className="space-y-1">
            {expense.shares.map((share) => (
              <div
                key={share.userId}
                className="flex items-center justify-between rounded-sm bg-bg-elevated px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    firstName={share.firstName}
                    lastName={share.lastName}
                    size="sm"
                  />
                  <span className="text-sm text-text-primary">
                    {share.firstName || share.username || 'Member'} {share.lastName || ''}
                  </span>
                </div>
                <span className="font-mono text-sm font-medium text-text-primary">
                  {formatCurrency(share.shareAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipt */}
      {expense.receiptUrl && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            Receipt
          </h4>
          <img
            src={expense.receiptUrl}
            alt="Receipt"
            className="max-h-48 rounded-sm border border-border object-contain"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="secondary" size="sm" icon={Pencil} onClick={() => onEdit(expense)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(expense)}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
