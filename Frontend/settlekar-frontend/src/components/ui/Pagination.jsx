import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible);
  if (end - start < maxVisible) {
    start = Math.max(0, end - maxVisible);
  }

  for (let i = start; i < end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex h-8 w-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 0 && (
        <>
          <PageButton page={0} current={currentPage} onClick={onPageChange} />
          {start > 1 && <span className="px-1 text-text-muted">...</span>}
        </>
      )}

      {pages.map((page) => (
        <PageButton key={page} page={page} current={currentPage} onClick={onPageChange} />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-text-muted">...</span>}
          <PageButton page={totalPages - 1} current={currentPage} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="flex h-8 w-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-elevated hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PageButton({ page, current, onClick }) {
  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-sm text-sm transition-colors',
        page === current
          ? 'bg-accent text-white'
          : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary'
      )}
    >
      {page + 1}
    </button>
  );
}
