import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeftRight } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { SettlementSuggestions } from '../components/settlements/SettlementSuggestions';
import { SettlementsTable } from '../components/settlements/SettlementsTable';
import { CreateSettlementModal } from '../components/settlements/CreateSettlementModal';
import { useGroups } from '../hooks/useGroups';
import { useSettlements } from '../hooks/useSettlements';
import { useAuth } from '../hooks/useAuth';
import { confirmSettlement } from '../api/settlements';
import { getMembers } from '../api/groups';
import { useEffect } from 'react';

export default function SettlementsPage() {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [members, setMembers] = useState([]);

  const { groups, isLoading: groupsLoading } = useGroups();
  const { settlements, suggestions, isLoading, pagination, refetch } =
    useSettlements(selectedGroupId || null);

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  useEffect(() => {
    if (!selectedGroupId) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        const res = await getMembers(selectedGroupId);
        setMembers(res.data || []);
      } catch {
        setMembers([]);
      }
    };

    fetchMembers();
  }, [selectedGroupId]);

  const handleSettle = useCallback(
    (data) => {
      setPrefill(data);
      setIsModalOpen(true);
    },
    []
  );

  const handleConfirm = useCallback(
    async (settlementId) => {
      try {
        await confirmSettlement(selectedGroupId, settlementId);
        toast.success('Settlement confirmed');
        refetch();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to confirm settlement');
      }
    },
    [selectedGroupId, refetch]
  );

  const handleCreateNew = () => {
    setPrefill(null);
    setIsModalOpen(true);
  };

  if (!selectedGroupId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <ArrowLeftRight className="h-8 w-8 text-accent-light" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Select a Group</h2>
        <p className="mb-6 text-sm text-text-secondary">Choose a group to view and manage settlements</p>
        <div className="w-72">
          <Select
            placeholder="Select a group"
            options={groupOptions}
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settlements</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Settle up and track payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <Select
              placeholder="Select a group"
              options={groupOptions}
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateNew} size="sm">
            New Settlement
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-8">
          <SettlementSuggestions
            suggestions={suggestions}
            groupId={selectedGroupId}
            members={members}
            currentUserId={user?.id}
            onSettle={handleSettle}
          />

          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              Settlement History
            </h3>
            <SettlementsTable
              settlements={settlements}
              currentUserId={user?.id}
              onConfirm={handleConfirm}
              onPaymentSuccess={refetch}
              pagination={pagination}
              onPageChange={pagination.setPage}
            />
          </div>
        </div>
      )}

      <CreateSettlementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupId={selectedGroupId}
        prefill={prefill}
        members={members}
        onSuccess={refetch}
      />
    </div>
  );
}
