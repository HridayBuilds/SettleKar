import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
      toast.success('Password reset link has been sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">SettleKar</h1>
        </div>

        <Card>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Reset Password
          </h2>
          <p className="mb-6 text-sm text-text-secondary">
            Enter your email and we'll send you a reset link.
          </p>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <p className="text-sm text-text-secondary">
                Check your email for the password reset link.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center gap-2 text-sm text-accent-light hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Enter a valid email',
                  },
                })}
              />

              <Button type="submit" isLoading={isLoading} className="w-full">
                Send Reset Link
              </Button>

              <p className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-accent-light hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
