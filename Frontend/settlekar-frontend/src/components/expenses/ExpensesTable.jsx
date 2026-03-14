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
  Paperclip,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../ui/Table';
import { formatDate, formatCurrency } from '../../lib/formatters';
import { SPLIT_METHODS } from '../../lib/constants';

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

export function ExpensesTable({ expenses = [], onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        No expenses yet
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableHeaderCell>Date</TableHeaderCell>
        <TableHeaderCell>Description</TableHeaderCell>
        <TableHeaderCell className="text-right">Amount</TableHeaderCell>
        <TableHeaderCell>Paid By</TableHeaderCell>
        <TableHeaderCell>Split</TableHeaderCell>
        {(onEdit || onDelete) && (
          <TableHeaderCell className="text-right">Actions</TableHeaderCell>
        )}
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => {
          const CategoryIcon =
            CATEGORY_ICONS[expense.category] || MoreHorizontal;

          return (
            <TableRow key={expense.id} className="group">
              <TableCell className="whitespace-nowrap text-text-secondary">
                {formatDate(expense.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 flex-shrink-0 text-text-muted" />
                  <span className="truncate">{expense.description}</span>
                  {expense.receiptUrl && (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-accent-light hover:text-accent transition-colors"
                      title="View receipt"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right" mono>
                <span className="text-accent-light">
                  {formatCurrency(expense.amount)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar
                    firstName={expense.paidByFirstName || expense.paidByName?.split(' ')[0]}
                    lastName={expense.paidByLastName || expense.paidByName?.split(' ')[1]}
                    size="sm"
                  />
                  <Badge variant="default">
                    {expense.paidByName || `${expense.paidByFirstName || ''} ${expense.paidByLastName || ''}`.trim()}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary">
                {SPLIT_METHODS[expense.splitMethod] || expense.splitMethod}
              </TableCell>
              {(onEdit || onDelete) && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(expense)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(expense)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm text-text-muted hover:bg-bg-elevated hover:text-danger transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
