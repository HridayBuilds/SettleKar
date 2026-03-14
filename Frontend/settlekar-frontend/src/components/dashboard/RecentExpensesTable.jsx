import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Card } from '../ui/Card';
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../ui/Table';
import { formatDate, formatCurrency } from '../../lib/formatters';

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

export function RecentExpensesTable({ expenses = [], groupNames = {} }) {
  const displayed = expenses.slice(0, 5);

  return (
    <Card className="flex flex-col">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Recent Expenses
      </h3>

      {displayed.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No expenses yet
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Group</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {displayed.map((expense) => {
              const CategoryIcon =
                CATEGORY_ICONS[expense.category] || MoreHorizontal;
              return (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {formatDate(expense.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 flex-shrink-0 text-text-muted" />
                      <span className="truncate">{expense.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {groupNames[expense.groupId] || '--'}
                  </TableCell>
                  <TableCell className="text-right" mono>
                    <span className="text-accent-light">
                      {formatCurrency(expense.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <Link
          to="/expenses"
          className="text-xs font-medium text-accent-light hover:text-accent transition-colors"
        >
          View All
        </Link>
      </div>
    </Card>
  );
}
