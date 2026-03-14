import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../ui/Table';
import { formatCurrency } from '../../lib/formatters';
import { cn } from '../../lib/utils';

export function BalanceSummaryCards({ balances = [] }) {
  if (balances.length === 0) return null;

  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell className="text-right">Balance</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {balances.map((member) => {
            const isPositive = member.netBalance >= 0;
            const isZero = member.netBalance === 0;
            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      firstName={member.firstName}
                      lastName={member.lastName}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.username && (
                        <p className="text-xs text-text-muted">@{member.username}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right" mono>
                  <span
                    className={cn(
                      'font-semibold',
                      isZero ? 'text-text-muted' : isPositive ? 'text-success' : 'text-danger'
                    )}
                  >
                    {isPositive && !isZero ? '+' : ''}{formatCurrency(member.netBalance)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isZero ? 'text-text-muted' : isPositive ? 'text-success' : 'text-danger'
                    )}
                  >
                    {isZero ? 'Settled' : isPositive ? 'They owe you' : 'You owe'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
