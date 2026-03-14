import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === tab.key
              ? 'text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          {tab.label}
          {activeTab === tab.key && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
