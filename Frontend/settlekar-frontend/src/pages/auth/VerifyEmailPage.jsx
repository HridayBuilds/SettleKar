import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { verifyEmail } from '../../api/auth';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">SettleKar</h1>
        </div>

        <Card className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-sm text-text-secondary">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Email Verified</h2>
              <p className="text-sm text-text-secondary">{message}</p>
              <Link
                to="/login"
                className="text-sm text-accent-light hover:underline"
              >
                Continue to login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/15">
                <XCircle className="h-8 w-8 text-danger" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Verification Failed</h2>
              <p className="text-sm text-text-secondary">{message}</p>
              <Link
                to="/login"
                className="text-sm text-accent-light hover:underline"
              >
                Go to login
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
