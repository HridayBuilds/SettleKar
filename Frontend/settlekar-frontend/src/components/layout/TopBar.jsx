import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

export function TopBar({ onMenuToggle }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-page px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="text-text-muted hover:text-text-primary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Link
          to="/activity"
          className="flex h-10 w-10 items-center justify-center rounded-sm text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
        >
          <Bell className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
