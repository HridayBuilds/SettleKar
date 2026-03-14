import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-page px-4 text-center">
      <h1 className="text-6xl font-bold text-text-primary">404</h1>
      <p className="mt-4 text-lg text-text-secondary">Page not found</p>
      <p className="mt-2 text-sm text-text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button icon={Home}>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
