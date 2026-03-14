import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Check, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { updateProfile, checkUsername } from '../../api/users';
import { GENDERS } from '../../lib/constants';
import { useDebounce } from '../../hooks/useDebounce';

export function ProfileForm({ user, onUpdate }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dob: user?.dob || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
    },
  });

  const watchedUsername = watch('username');
  const debouncedUsername = useDebounce(watchedUsername, 500);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername === user?.username) {
      setUsernameStatus(null);
      return;
    }

    const check = async () => {
      setUsernameChecking(true);
      try {
        const res = await checkUsername(debouncedUsername);
        setUsernameStatus(res.data?.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('error');
      } finally {
        setUsernameChecking(false);
      }
    };

    check();
  }, [debouncedUsername, user?.username]);

  const genderOptions = Object.entries(GENDERS).map(([value, label]) => ({
    value,
    label,
  }));

  const onSubmit = async (data) => {
    if (usernameStatus === 'taken') {
      toast.error('Username is already taken');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob || null,
        phone: data.phone || null,
        gender: data.gender || null,
      });
      toast.success('Profile updated successfully');
      onUpdate?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="mb-6 text-lg font-semibold text-text-primary">
        Personal Information
      </h3>

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
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Only letters, numbers and underscores',
              },
            })}
          />
          {watchedUsername && watchedUsername !== user?.username && (
            <div className="absolute right-3 top-8 flex items-center">
              {usernameChecking ? (
                <span className="text-xs text-text-muted">checking...</span>
              ) : usernameStatus === 'available' ? (
                <Check className="h-4 w-4 text-success" />
              ) : usernameStatus === 'taken' ? (
                <X className="h-4 w-4 text-danger" />
              ) : null}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            placeholder="John"
            error={errors.firstName?.message}
            {...register('firstName', {
              required: 'First name is required',
            })}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName', {
              required: 'Last name is required',
            })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Date of Birth"
            type="date"
            error={errors.dob?.message}
            {...register('dob')}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+91 9876543210"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <Select
          label="Gender"
          placeholder="Select gender"
          options={genderOptions}
          error={errors.gender?.message}
          {...register('gender')}
        />

        <div className="pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
