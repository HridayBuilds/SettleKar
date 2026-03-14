import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { BalanceSummaryCards } from '../components/balances/BalanceSummaryCards';
import { PairwiseBalanceList } from '../components/balances/PairwiseBalanceList';
import { DebtGraph } from '../components/balances/DebtGraph';
import { ContributionPieChart } from '../components/balances/ContributionPieChart';
import { useGroups } from '../hooks/useGroups';
import { useBalances } from '../hooks/useBalances';
import { useAnalytics } from '../hooks/useAnalytics';

export default function BalancesPage() {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const { groups, isLoading: groupsLoading } = useGroups();
  const { pairwise, summary, graph, isLoading: balancesLoading } =
    useBalances(selectedGroupId || null);
  const { categoryData, isLoading: analyticsLoading } =
    useAnalytics(selectedGroupId || null);

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  if (!selectedGroupId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Wallet className="h-8 w-8 text-accent-light" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Select a Group</h2>
        <p className="mb-6 text-sm text-text-secondary">Choose a group to view balances</p>
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

  const isLoading = balancesLoading || analyticsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Balances</h1>
          <p className="mt-1 text-sm text-text-secondary">
            See who owes what in your groups
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <BalanceSummaryCards balances={summary} />
          <PairwiseBalanceList balances={pairwise} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DebtGraph graph={graph} />
            <ContributionPieChart categoryData={categoryData} />
          </div>
        </div>
      )}
    </div>
  );
}
