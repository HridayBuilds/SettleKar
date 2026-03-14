import { Card } from '../ui/Card';
import { formatCurrency, formatPercentage } from '../../lib/formatters';
import { cn } from '../../lib/utils';

export function KpiCard({ title, amount, trend, subtitle, icon: Icon, isCurrency = true }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {title}
        </p>
        {Icon && (
          <Icon className="h-5 w-5 text-accent-light" />
        )}
      </div>

      <p className="mt-2 font-mono text-2xl font-bold text-text-primary">
        {isCurrency ? formatCurrency(amount) : amount}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {trend != null && (
          <span
            className={cn(
              'text-xs font-medium',
              trend >= 0 ? 'text-success' : 'text-danger'
            )}
          >
            {formatPercentage(trend)}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-text-muted">{subtitle}</span>
        )}
      </div>
    </Card>
  );
}
