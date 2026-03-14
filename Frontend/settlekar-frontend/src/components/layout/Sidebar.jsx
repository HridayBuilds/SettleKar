import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/groups', label: 'Groups', icon: Users },
  { path: '/balances', label: 'Balances', icon: Wallet },
  { path: '/settlements', label: 'Settlements', icon: ArrowLeftRight },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-60 flex-col bg-bg-sidebar transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Settle<span className="text-accent">Kar</span></h1>
            <p className="text-[10px] tracking-widest text-text-muted uppercase">Expense Management</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-l-[3px] border-accent bg-bg-elevated text-text-primary'
                    : 'border-l-[3px] border-transparent text-text-muted hover:bg-accent/[0.08] hover:text-text-secondary'
                )}
              >
                <item.icon className={cn('h-[18px] w-[18px]', isActive && 'text-accent')} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-border px-4 py-3">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm text-text-secondary hover:bg-accent/[0.08] transition-colors"
          >
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="truncate text-sm font-medium text-text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-text-muted">
                @{user?.username || 'no username'}
              </p>
            </div>
          </NavLink>
        </div>

        <div className="border-t border-border px-4 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
