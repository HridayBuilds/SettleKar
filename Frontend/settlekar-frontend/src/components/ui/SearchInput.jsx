import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export function SearchInput({ value, onChange, placeholder = 'Search...', className, delay = 300 }) {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const debouncedOnChange = useCallback(
    (() => {
      let timer;
      return (val) => {
        clearTimeout(timer);
        timer = setTimeout(() => onChange?.(val), delay);
      };
    })(),
    [onChange, delay]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    debouncedOnChange(val);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-sm border border-border bg-bg-elevated pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none"
      />
    </div>
  );
}
