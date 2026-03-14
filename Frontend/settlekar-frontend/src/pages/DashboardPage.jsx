import { useState, useEffect } from 'react';
import { Wallet, Users, TrendingDown, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { KpiCard } from '../components/dashboard/KpiCard';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { TopGroupsList } from '../components/dashboard/TopGroupsList';
import { getGroups } from '../api/groups';
import { getMonthlyAnalytics } from '../api/analytics';
import { getLedger } from '../api/groups';

export default function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true);
      try {
        const groupsRes = await getGroups(0, 20);
        const groupsList = groupsRes.data.content || [];
        setGroups(groupsList);

        if (groupsList.length > 0) {
          try {
            const analyticsRes = await getMonthlyAnalytics(groupsList[0].id);
            setMonthlyData(analyticsRes.data || []);
          } catch {
            setMonthlyData([]);
          }

          try {
            const ledgerRes = await getLedger(groupsList[0].id, 0, 8);
            setActivities(ledgerRes.data.content || []);
          } catch {
            setActivities([]);
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-bold text-text-primary">Dashboard</h1>
        <EmptyState
          icon={Users}
          title="No groups yet"
          subtitle="Create your first group to start tracking expenses"
          actionLabel="Create Group"
          onAction={() => window.location.href = '/groups'}
        />
      </div>
    );
  }

  const totalBalance = groups.reduce(
    (sum, g) => sum + (g.currentUserBalance ?? 0),
    0
  );
  const groupsActive = groups.length;
  const youOwe = groups.reduce((sum, g) => {
    const bal = g.currentUserBalance ?? 0;
    return bal < 0 ? sum + Math.abs(bal) : sum;
  }, 0);
  const othersOweYou = groups.reduce((sum, g) => {
    const bal = g.currentUserBalance ?? 0;
    return bal > 0 ? sum + bal : sum;
  }, 0);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Dashboard</h1>

      {/* KPI Row */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Balance"
          amount={totalBalance}
          icon={Wallet}
          subtitle="Across all groups"
        />
        <KpiCard
          title="You Owe"
          amount={youOwe}
          icon={TrendingDown}
          subtitle="Total amount you owe"
        />
        <KpiCard
          title="Others Owe You"
          amount={othersOweYou}
          icon={TrendingUp}
          subtitle="Money people owe you"
        />
        <KpiCard
          title="Groups Active"
          amount={groupsActive}
          icon={Users}
          subtitle="Your current groups"
          isCurrency={false}
        />
      </div>

      {/* Middle Row: SpendingChart + RecentActivity */}
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingChart data={monthlyData} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* Bottom Row: TopGroups */}
      <div>
        <TopGroupsList groups={groups} />
      </div>
    </div>
  );
}
