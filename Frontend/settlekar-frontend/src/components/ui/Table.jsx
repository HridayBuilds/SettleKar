import { cn } from '../../lib/utils';

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead>
      <tr className={cn('text-left', className)}>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({ children, className, onClick, sortable }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted',
        sortable && 'cursor-pointer hover:text-text-secondary',
        className
      )}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-white/[0.03]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, mono }) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-text-primary',
        mono && 'font-mono',
        className
      )}
    >
      {children}
    </td>
  );
}
