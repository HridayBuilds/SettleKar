import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, checkUsername } from '../../api/users';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const COUNTRY_CODES = [
  { value: '+91', label: '+91 (India)' },
  { value: '+1', label: '+1 (USA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+65', label: '+65 (Singapore)' },
  { value: '+60', label: '+60 (Malaysia)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
];

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchedUsername = watch('username');
  const debouncedUsername = useDebounce(watchedUsername, 500);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!authLoading && user?.username) {
      navigate('/dashboard');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setUsernameStatus(null);
      return;
    }
    const check = async () => {
      setUsernameChecking(true);
      try {
        const res = await checkUsername(debouncedUsername);
        setUsernameStatus(res.data?.success ? 'available' : 'taken');
      } catch {
        setUsernameStatus('error');
      } finally {
        setUsernameChecking(false);
      }
    };
    check();
  }, [debouncedUsername]);

  const onSubmit = async (data) => {
    if (usernameStatus === 'taken') {
      toast.error('Username is already taken');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        username: data.username,
        firstName: user?.firstName || data.firstName,
        lastName: user?.lastName || data.lastName,
        dob: data.dob || null,
        phone: data.phone ? `${countryCode}${data.phone}` : null,
      });
      updateUser(res.data);
      toast.success('Welcome to SettleKar!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">SettleKar</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Complete your profile to get started
          </p>
        </div>

        <Card>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Almost there!
          </h2>
          <p className="mb-6 text-sm text-text-secondary">
            Please set a username and fill in your details. A username is required to use SettleKar.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label="Username"
                icon={User}
                placeholder="your_username"
                error={errors.username?.message}
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Must be at least 3 characters' },
                  maxLength: { value: 30, message: 'Max 30 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Only letters, numbers and underscores',
                  },
                })}
              />
              {watchedUsername && watchedUsername.length >= 3 && (
                <div className="absolute right-3 top-8 flex items-center">
                  {usernameChecking ? (
                    <span className="text-sm text-text-muted">checking...</span>
                  ) : usernameStatus === 'available' ? (
                    <span className="text-sm font-bold text-success">Available</span>
                  ) : usernameStatus === 'taken' ? (
                    <span className="text-sm font-bold text-danger">Taken</span>
                  ) : null}
                </div>
              )}
            </div>

            <Input
              label="Date of Birth"
              type="date"
              icon={Calendar}
              error={errors.dob?.message}
              {...register('dob', {
                required: 'Date of birth is required',
              })}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-10 rounded-sm border border-border bg-bg-elevated px-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc.value} value={cc.value}>
                      {cc.label}
                    </option>
                  ))}
                </select>
                <div className="flex-1">
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    error={errors.phone?.message}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{7,15}$/,
                        message: 'Enter a valid phone number',
                      },
                    })}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Complete Profile
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
