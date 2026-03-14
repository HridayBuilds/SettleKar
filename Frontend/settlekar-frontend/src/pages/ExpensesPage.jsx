import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useGroups } from '../hooks/useGroups';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency, formatDate } from '../lib/formatters';
import { EXPENSE_CATEGORIES } from '../lib/constants';

export default function ExpensesPage() {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const { groups, isLoading: groupsLoading } = useGroups();
  const { expenses, isLoading: expensesLoading, pagination } =
    useExpenses(selectedGroupId || null);

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Expenses</h1>
          <p className="mt-1 text-sm text-text-secondary">
            View and manage group expenses
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            placeholder="Select a group"
            options={groupOptions}
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          />
        </div>
      </div>

      {!selectedGroupId ? (
        <EmptyState
          icon={Receipt}
          title="Select a group"
          subtitle="Choose a group from the dropdown to view expenses"
        />
      ) : expensesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses"
          subtitle="This group has no expenses yet"
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Paid By</TableHeaderCell>
              <TableHeaderCell>Split</TableHeaderCell>
              <TableHeaderCell className="text-right">Amount</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {formatDate(expense.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-text-primary">
                      {expense.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {EXPENSE_CATEGORIES[expense.category]?.label || expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {expense.paidByName || expense.paidByUsername || '--'}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {expense.splitMethod || '--'}
                  </TableCell>
                  <TableCell className="text-right" mono>
                    <span className="font-semibold text-accent-light">
                      {formatCurrency(expense.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="px-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
