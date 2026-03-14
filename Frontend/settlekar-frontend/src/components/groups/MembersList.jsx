import { useState } from 'react';
import { Plus, MoreVertical, ShieldCheck, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '../ui/Avatar';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AddMemberModal } from './AddMemberModal';
import { updateMemberRole, removeMember } from '../../api/groups';

export function MembersList({ members = [], groupId, currentUserRole, onUpdate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const isAdmin = currentUserRole === 'ADMIN';

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateMemberRole(groupId, userId, newRole);
      toast.success('Role updated');
      setMenuOpenId(null);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setIsRemoving(true);
    try {
      await removeMember(groupId, removeTarget.userId);
      toast.success('Member removed');
      setRemoveTarget(null);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Members ({members.length})
        </h3>
        {isAdmin && (
          <Button size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Member
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.userId}
            className="relative flex items-center gap-3 rounded-md border border-border bg-bg-card p-3"
          >
            <Avatar
              firstName={member.firstName}
              lastName={member.lastName}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {member.firstName} {member.lastName}
              </p>
              <p className="truncate text-xs text-text-muted">
                @{member.username}
              </p>
            </div>
            <StatusBadge status={member.role} />

            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === member.userId ? null : member.userId)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {menuOpenId === member.userId && (
                  <div className="absolute right-0 top-8 z-10 w-44 rounded-sm border border-border bg-bg-elevated py-1 shadow-lg">
                    {member.role === 'MEMBER' ? (
                      <button
                        onClick={() => handleRoleChange(member.userId, 'ADMIN')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Make Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(member.userId, 'MEMBER')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Make Member
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRemoveTarget(member);
                        setMenuOpenId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-bg-card transition-colors"
                    >
                      <UserMinus className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        groupId={groupId}
        onSuccess={() => {
          setShowAddModal(false);
          onUpdate?.();
        }}
      />

      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove Member"
        message={`Are you sure you want to remove ${removeTarget?.firstName} ${removeTarget?.lastName} from this group?`}
        confirmLabel="Remove"
        isLoading={isRemoving}
      />
    </div>
  );
}
