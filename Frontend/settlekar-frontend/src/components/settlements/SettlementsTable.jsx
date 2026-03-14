import { Card } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Pagination } from '../ui/Pagination';
import { RazorpayButton } from './RazorpayButton';
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '../ui/Table';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Receipt } from 'lucide-react';

export function SettlementsTable({
  settlements = [],
  currentUserId,
  onConfirm,
  onPaymentSuccess,
  pagination,
  onPageChange,
}) {
  if (settlements.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Receipt}
          title="No settlements"
          subtitle="Settlements will appear here once created"
        />
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableHeaderCell>Payer</TableHeaderCell>
          <TableHeaderCell>Receiver</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Method</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Action</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {settlements.map((settlement) => {
            const isPayer = String(currentUserId) === String(settlement.payerId);
            const isReceiver = String(currentUserId) === String(settlement.receiverId);
            const isPending = settlement.status === 'PENDING';
            const isRazorpay = settlement.method === 'RAZORPAY';

            return (
              <TableRow key={settlement.id}>
                <TableCell>
                  <span className="text-sm font-medium text-text-primary">
                    {settlement.payerName || '--'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-text-primary">
                    {settlement.receiverName || '--'}
                  </span>
                </TableCell>
                <TableCell mono>
                  <span className="font-semibold text-accent-light">
                    {formatCurrency(settlement.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  {settlement.status === 'COMPLETED' ? (
                    <Badge variant="completed">Settled</Badge>
                  ) : (
                    <StatusBadge status={settlement.status} />
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={isRazorpay ? 'accent' : 'default'}>
                    {settlement.method}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-text-secondary">
                  {formatDate(settlement.createdAt)}
                </TableCell>
                <TableCell>
                  {isPending && isRazorpay && isPayer && (
                    <RazorpayButton
                      settlementId={settlement.id}
                      amount={settlement.amount}
                      onSuccess={onPaymentSuccess}
                    />
                  )}
                  {isPending && !isRazorpay && isReceiver && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onConfirm?.(settlement.id)}
                    >
                      Confirm Received
                    </Button>
                  )}
                  {isPending && !isRazorpay && isPayer && (
                    <span className="text-xs text-text-muted">
                      Waiting for confirmation
                    </span>
                  )}
                  {isPending && isRazorpay && isReceiver && (
                    <span className="text-xs text-text-muted">
                      Waiting for payment
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {pagination && (
        <div className="px-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
}
