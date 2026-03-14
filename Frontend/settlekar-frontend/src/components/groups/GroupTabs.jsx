import { Receipt, Wallet, BarChart3 } from 'lucide-react';
import { Tabs } from '../ui/Tabs';

const GROUP_TABS = [
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'balances', label: 'Balances', icon: Wallet },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function GroupTabs({ activeTab, onChange }) {
  return <Tabs tabs={GROUP_TABS} activeTab={activeTab} onChange={onChange} />;
}
