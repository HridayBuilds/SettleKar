import { Spinner } from '../components/ui/Spinner';
import { ProfileForm } from '../components/profile/ProfileForm';
import { ChangePasswordForm } from '../components/profile/ChangePasswordForm';
import { SetPasswordForm } from '../components/profile/SetPasswordForm';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">Profile Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your account information and security
          </p>
        </div>

        <ProfileForm user={user} onUpdate={updateUser} />

        {user?.authProvider === 'GOOGLE' ? (
          <SetPasswordForm />
        ) : (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
}
