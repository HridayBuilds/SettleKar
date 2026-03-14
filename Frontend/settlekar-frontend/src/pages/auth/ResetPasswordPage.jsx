import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft } from 'lucide-react';
import { resetPassword, validateResetToken } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('newPassword');

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }
    validateResetToken(token)
      .then(() => setIsValid(true))
      .catch(() => setIsValid(false))
      .finally(() => setIsValidating(false));
  }, [token]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await resetPassword(token, data.newPassword);
      toast.success('Password has been reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">SettleKar</h1>
        </div>

        <Card>
          {!token || !isValid ? (
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold text-text-primary">Invalid Link</h2>
              <p className="text-sm text-text-secondary">
                This password reset link is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className="mt-4 inline-block text-sm text-accent-light hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-semibold text-text-primary">
                Set New Password
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  icon={Lock}
                  placeholder="Min 8 characters"
                  error={errors.newPassword?.message}
                  {...register('newPassword', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern: {
                      value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/,
                      message: 'Must include uppercase, lowercase, number, and special character',
                    },
                  })}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  icon={Lock}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Reset Password
                </Button>
              </form>
              <p className="mt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-accent-light hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
