import { useState } from 'react';
import { Activity, Receipt, ArrowLeftRight, Users } from 'lucide-react';
import { Tabs } from '../ui/Tabs';
import { Spinner } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { ActivityCard } from './ActivityCard';

const EXPENSE_TYPES = [
  'EXPENSE_ADDED',
  'EXPENSE_UPDATED',
  'EXPENSE_DELETED',
  'RECURRING_EXPENSE_GENERATED',
];

const PAYMENT_TYPES = [
  'SETTLEMENT_CREATED',
  'SETTLEMENT_COMPLETED',
  'SETTLEMENT_FAILED',
];

const GROUP_TYPES = [
  'GROUP_CREATED',
  'GROUP_LOCKED',
  'GROUP_SETTLED',
  'MEMBER_JOINED',
  'MEMBER_LEFT',
  'REMINDER_SENT',
];

const TABS = [
  { key: 'all', label: 'All', icon: Activity },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'payments', label: 'Payments', icon: ArrowLeftRight },
  { key: 'groups', label: 'Groups', icon: Users },
];

export function ActivityFeed({ entries = [], isLoading, onLoadMore, hasMore }) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredEntries = entries.filter((entry) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'expenses') return EXPENSE_TYPES.includes(entry.entryType);
    if (activeTab === 'payments') return PAYMENT_TYPES.includes(entry.entryType);
    if (activeTab === 'groups') return GROUP_TYPES.includes(entry.entryType);
    return true;
  });

  return (
    <div>
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 space-y-2">
        {isLoading && filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity"
            subtitle="Actions from your groups will appear here"
          />
        ) : (
          <>
            {filteredEntries.map((entry) => (
              <ActivityCard key={entry.id} entry={entry} />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onLoadMore}
                  isLoading={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
