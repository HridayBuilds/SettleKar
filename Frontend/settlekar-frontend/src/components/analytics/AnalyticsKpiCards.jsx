import { IndianRupee, Tag, Users, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';

export function AnalyticsKpiCards({ categoryData = [], monthlyData = [], memberData = [], groups = [] }) {
  const totalSpending = categoryData.reduce(
    (sum, cat) => sum + (cat.totalAmount || 0),
    0
  );

  const categoryCount = categoryData.length;

  const activeMemberCount = memberData.length;

  const monthlyAverage =
    monthlyData.length > 0
      ? monthlyData.reduce((sum, m) => sum + (m.totalAmount || 0), 0) /
        monthlyData.length
      : 0;

  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(totalSpending),
      icon: IndianRupee,
    },
    {
      title: 'Categories',
      value: categoryCount,
      icon: Tag,
    },
    {
      title: 'Active Members',
      value: activeMemberCount,
      icon: Users,
    },
    {
      title: 'Monthly Average',
      value: formatCurrency(monthlyAverage),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {card.title}
            </p>
            <card.icon className="h-5 w-5 text-accent-light" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-text-primary">
            {card.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
