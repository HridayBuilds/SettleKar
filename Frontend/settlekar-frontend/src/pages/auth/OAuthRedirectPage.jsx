import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/ui/Spinner';

export default function OAuthRedirectPage() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (!token) {
      toast.error('Authentication failed. No token received.');
      navigate('/login');
      return;
    }

    loginWithToken(token)
      .then((userData) => {
        if (!userData?.username) {
          navigate('/complete-profile');
        } else {
          toast.success('Welcome!');
          navigate('/dashboard');
        }
      })
      .catch(() => {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      });
  }, [token, loginWithToken, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Completing sign in...</p>
      </div>
    </div>
  );
}
