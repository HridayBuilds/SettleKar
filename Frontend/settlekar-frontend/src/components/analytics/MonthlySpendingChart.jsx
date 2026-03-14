import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { formatCurrency, formatCurrencyShort, formatMonthYear } from '../../lib/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;

  return (
    <div className="rounded-sm border border-border bg-bg-elevated px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">
        {formatCurrency(payload[0].value)}
      </p>
      {data?.expenseCount != null && (
        <p className="text-xs text-text-secondary">
          {data.expenseCount} expense{data.expenseCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

export function MonthlySpendingChart({ data = [] }) {
  const chartData = data.map((item) => ({
    ...item,
    name: formatMonthYear(item.month),
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Monthly Spending Trend
      </h3>

      {chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No monthly data available
        </p>
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border, rgba(255,255,255,0.06))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted, #6B7280)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => formatCurrencyShort(val)}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted, #6B7280)' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="totalAmount"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
