import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Lock, User } from 'lucide-react';
import { signup, getGoogleOAuthUrl } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@#$%^&+=!]/.test(pwd)) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-danger' };
    if (score <= 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-success' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success('Account created! Check your email for verification.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = getGoogleOAuthUrl();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Settle<span className="text-accent">Kar</span>
          </h1>
        </div>

        <Card>
          <h2 className="mb-6 text-xl font-semibold text-text-primary">Sign up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                icon={User}
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName', {
                  required: 'Required',
                  maxLength: { value: 50, message: 'Max 50 characters' },
                  pattern: {
                    value: /^[a-zA-Z\s'-]+$/,
                    message: 'Only letters allowed',
                  },
                })}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Required',
                  maxLength: { value: 50, message: 'Max 50 characters' },
                  pattern: {
                    value: /^[a-zA-Z\s'-]+$/,
                    message: 'Only letters allowed',
                  },
                })}
              />
            </div>

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

            <div>
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="Min 8 characters"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  pattern: {
                    value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/,
                    message: 'Must include uppercase, lowercase, number, and special character',
                  },
                })}
              />
              {password && passwordStrength && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-bg-elevated">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                      style={{
                        width:
                          passwordStrength.label === 'Weak' ? '25%' :
                          passwordStrength.label === 'Fair' ? '50%' :
                          passwordStrength.label === 'Good' ? '75%' : '100%',
                      }}
                    />
                  </div>
                  <span className="text-xs text-text-muted">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Account
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="secondary"
            onClick={handleGoogleSignup}
            className="w-full"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-light hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
