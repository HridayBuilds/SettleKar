import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';

const COLORS = [
  '#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#F97316', '#14B8A6',
];

const CATEGORY_LABELS = {
  FOOD: 'Food',
  TRANSPORT: 'Transport',
  ACCOMMODATION: 'Accommodation',
  ENTERTAINMENT: 'Entertainment',
  UTILITIES: 'Utilities',
  SHOPPING: 'Shopping',
  HEALTH: 'Health',
  EDUCATION: 'Education',
  OTHER: 'Other',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-text-primary">{data.label}</p>
      <p className="font-mono text-sm text-accent-light">
        {formatCurrency(data.totalAmount)}
      </p>
      {data.pct != null && (
        <p className="text-xs text-text-muted">{data.pct}%</p>
      )}
    </div>
  );
}

export function ContributionPieChart({ categoryData = [] }) {
  if (categoryData.length === 0) {
    return (
      <Card className="flex flex-col">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          Spending by Category
        </h3>
        <p className="py-8 text-center text-sm text-text-muted">
          No category data available
        </p>
      </Card>
    );
  }

  const total = categoryData.reduce((sum, d) => sum + (d.totalAmount || 0), 0);

  const data = categoryData.map((d) => ({
    ...d,
    label: CATEGORY_LABELS[d.category] || d.category,
    pct: total > 0 ? ((d.totalAmount / total) * 100).toFixed(1) : '0',
  }));

  return (
    <Card className="flex flex-col">
      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Spending by Category
      </h3>

      <div className="flex flex-1 flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="80%"
              paddingAngle={1}
              dataKey="totalAmount"
              nameKey="label"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  stroke="#1A2235"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-3 space-y-1.5 w-full">
          {data.map((entry, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-text-secondary">{entry.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-text-muted">
                  {formatCurrency(entry.totalAmount)}
                </span>
                <span className="font-mono text-xs text-text-muted w-10 text-right">
                  {entry.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
