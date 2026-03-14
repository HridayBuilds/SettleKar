import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { AnalyticsKpiCards } from '../components/analytics/AnalyticsKpiCards';
import { MonthlySpendingChart } from '../components/analytics/MonthlySpendingChart';
import { CategoryDonutChart } from '../components/analytics/CategoryDonutChart';
import { MemberContributions } from '../components/analytics/MemberContributions';
import { GroupComparison } from '../components/analytics/GroupComparison';
import { useGroups } from '../hooks/useGroups';
import { useAnalytics } from '../hooks/useAnalytics';

export default function AnalyticsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const { groups, isLoading: groupsLoading } = useGroups();
  const { categoryData, monthlyData, memberData, isLoading: analyticsLoading } =
    useAnalytics(selectedGroupId || null);

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  if (!selectedGroupId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <BarChart3 className="h-8 w-8 text-accent-light" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Select a Group</h2>
        <p className="mb-6 text-sm text-text-secondary">Choose a group to view analytics</p>
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
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Spending insights and group analytics
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

      {analyticsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <AnalyticsKpiCards
            categoryData={categoryData}
            monthlyData={monthlyData}
            memberData={memberData}
            groups={groups}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MonthlySpendingChart data={monthlyData} />
            </div>
            <div className="lg:col-span-1">
              <CategoryDonutChart data={categoryData} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MemberContributions data={memberData} />
            <GroupComparison groups={groups} />
          </div>
        </div>
      )}
    </div>
  );
}
