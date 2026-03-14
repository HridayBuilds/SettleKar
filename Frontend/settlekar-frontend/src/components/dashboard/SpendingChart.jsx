import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { formatCurrencyShort, formatMonthYear } from '../../lib/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-sm border border-border bg-bg-elevated px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">
        {formatCurrencyShort(payload[0].value)}
      </p>
    </div>
  );
}

export function SpendingChart({ data = [] }) {
  const chartData = data.map((item) => ({
    ...item,
    name: formatMonthYear(item.month),
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Spending Analytics
      </h3>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="totalAmount"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#spendingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
