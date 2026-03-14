import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { setPassword } from '../../api/users';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function SetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await setPassword(data.password);
      toast.success('Password set successfully');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="mb-1 text-lg font-semibold text-text-primary">
        Set Password
      </h3>
      <p className="mb-6 text-sm text-text-secondary">
        Set a password for your Google account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            pattern: {
              value: PASSWORD_REGEX,
              message:
                'Must contain uppercase, lowercase, number, and special character (min 8 chars)',
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
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
        />

        <div className="pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            Set Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
