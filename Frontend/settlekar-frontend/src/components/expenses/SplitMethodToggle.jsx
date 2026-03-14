import { motion } from 'framer-motion';
import { SPLIT_METHODS } from '../../lib/constants';
import { cn } from '../../lib/utils';

const methods = Object.keys(SPLIT_METHODS);

export function SplitMethodToggle({ value, onChange }) {
  const activeIndex = methods.indexOf(value);

  return (
    <div className="relative flex rounded-sm bg-bg-elevated p-1">
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-sm bg-accent"
        initial={false}
        animate={{
          left: `calc(${(activeIndex / methods.length) * 100}% + 4px)`,
          width: `calc(${100 / methods.length}% - 8px)`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {methods.map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onChange(method)}
          className={cn(
            'relative z-10 flex-1 rounded-sm px-3 py-1.5 text-center text-sm font-medium transition-colors',
            value === method ? 'text-white' : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {SPLIT_METHODS[method]}
        </button>
      ))}
    </div>
  );
}
