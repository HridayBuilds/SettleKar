import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { GroupHeader } from '../components/groups/GroupHeader';
import { MembersList } from '../components/groups/MembersList';
import { GroupSettingsModal } from '../components/groups/GroupSettingsModal';
import { ExpensesTable } from '../components/expenses/ExpensesTable';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { EditExpenseModal } from '../components/expenses/EditExpenseModal';
import { useGroupDetail } from '../hooks/useGroupDetail';
import { useExpenses } from '../hooks/useExpenses';
import { useSettlements } from '../hooks/useSettlements';
import { useAuth } from '../hooks/useAuth';
import { deleteExpense } from '../api/expenses';
import { exportCSV } from '../api/exports';
import { formatDateTime, formatCurrency } from '../lib/formatters';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { group, members, isLoading: groupLoading, refetch: refetchGroup } = useGroupDetail(groupId);
  const { expenses, isLoading: expensesLoading, pagination: expensesPagination, refetch: refetchExpenses } = useExpenses(groupId);
  const { suggestions, isLoading: settlementsLoading } = useSettlements(groupId);

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [membersCollapsed, setMembersCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentMember = members.find(
    (m) => m.userId === user?.id || m.username === user?.username
  );
  const currentUserRole = currentMember?.role || 'MEMBER';
  const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'OWNER';

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await deleteExpense(groupId, deletingExpense.id);
      toast.success('Expense deleted');
      setDeletingExpense(null);
      refetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await exportCSV(groupId);
      toast.success('CSV exported');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGroupDelete = () => {
    navigate('/groups');
  };

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-text-secondary">Group not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/groups')}>
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar with Export CSV and Last Updated */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
          isLoading={isExporting}
        >
          Export CSV
        </Button>
        <span className="text-xs text-text-muted">
          Last updated: {formatDateTime(group.updatedAt || group.createdAt)}
        </span>
      </div>

      <GroupHeader
        group={group}
        memberCount={members.length}
        onAddExpense={() => setShowAddExpense(true)}
        onSettings={isAdmin ? () => setShowSettings(true) : null}
        totalExpenses={totalExpenses}
      />

      {/* Members */}
      <div className="mt-6">
        <button
          onClick={() => setMembersCollapsed(!membersCollapsed)}
          className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
        >
          {membersCollapsed ? 'Show Members' : 'Hide Members'}
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent-light">
            {members.length}
          </span>
        </button>
        {!membersCollapsed && (
          <MembersList
            members={members}
            groupId={groupId}
            currentUserRole={currentUserRole}
            onUpdate={refetchGroup}
          />
        )}
      </div>

      {/* Expenses */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Expenses</h3>
        {expensesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <ExpensesTable
            expenses={expenses}
            onEdit={(expense) => setEditingExpense(expense)}
            onDelete={(expense) => setDeletingExpense(expense)}
          />
        )}

        {expensesPagination && expensesPagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={expensesPagination.page}
              totalPages={expensesPagination.totalPages}
              onPageChange={expensesPagination.setPage}
            />
          </div>
        )}

        <Card className="mt-6">
          <h3 className="text-sm font-semibold text-text-primary">
            Settlement Suggestions
          </h3>
          {settlementsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="mt-3 space-y-2">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-sm bg-bg-elevated px-3 py-2 text-sm"
                >
                  <span className="text-text-secondary">
                    {s.fromName || s.fromUsername} pays {s.toName || s.toUsername}
                  </span>
                  <span className="font-mono font-medium text-accent-light">
                    {formatCurrency(s.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-muted">
              All settled up!
            </p>
          )}
        </Card>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        groupId={groupId}
        members={members}
        onSuccess={() => {
          setShowAddExpense(false);
          refetchExpenses();
          refetchGroup();
        }}
      />

      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        groupId={groupId}
        expense={editingExpense}
        members={members}
        onSuccess={() => {
          setEditingExpense(null);
          refetchExpenses();
          refetchGroup();
        }}
      />

      {isAdmin && (
        <GroupSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          group={group}
          onUpdate={() => {
            refetchGroup();
            setShowSettings(false);
          }}
          onDelete={handleGroupDelete}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deletingExpense?.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
