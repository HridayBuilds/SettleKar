import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { changePassword } from '../../api/users';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h3 className="mb-6 text-lg font-semibold text-text-primary">
        Change Password
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          icon={Lock}
          placeholder="Enter current password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', {
            required: 'Current password is required',
          })}
        />

        <Input
          label="New Password"
          type="password"
          icon={Lock}
          placeholder="Enter new password"
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'New password is required',
            pattern: {
              value: PASSWORD_REGEX,
              message:
                'Must contain uppercase, lowercase, number, and special character (min 8 chars)',
            },
          })}
        />

        <Input
          label="Confirm New Password"
          type="password"
          icon={Lock}
          placeholder="Re-enter new password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword', {
            required: 'Please confirm your new password',
            validate: (value) =>
              value === newPassword || 'Passwords do not match',
          })}
        />

        <div className="pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
