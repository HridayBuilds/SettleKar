import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';

const COLORS = [
  '#2563EB',
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#10B981',
  '#64748B',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;

  return (
    <div className="rounded-sm border border-border bg-bg-elevated px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-text-primary">{data.category}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-accent-light">
        {formatCurrency(data.totalAmount)}
      </p>
    </div>
  );
}

export function CategoryDonutChart({ data = [] }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Category Distribution
      </h3>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No category data available
        </p>
      ) : (
        <>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="totalAmount"
                  nameKey="category"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {data.map((item, index) => (
              <div
                key={item.category}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-text-secondary">{item.category}</span>
                </div>
                <span className="font-mono text-xs text-text-muted">
                  {item.percentage != null
                    ? `${Number(item.percentage).toFixed(1)}%`
                    : '--'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
