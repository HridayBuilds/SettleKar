import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { updateGroup, lockGroup, deleteGroup } from '../../api/groups';

export function GroupSettingsModal({ isOpen, onClose, group, onUpdate, onDelete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: {
      name: group?.name || '',
      description: group?.description || '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateGroup(group.id, {
        name: data.name,
        description: data.description,
      });
      toast.success('Group updated');
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async () => {
    setIsLocking(true);
    try {
      await lockGroup(group.id);
      toast.success('Group locked');
      setShowLockConfirm(false);
      onUpdate?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to lock group');
    } finally {
      setIsLocking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGroup(group.id);
      toast.success('Group deleted');
      setShowDeleteConfirm(false);
      onDelete?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Group Settings">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Description"
            placeholder="Brief description"
            {...register('description')}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>

        <hr className="my-6 border-border" />

        <div className="space-y-3">
          {group?.status === 'ACTIVE' && (
            <Button
              variant="secondary"
              className="w-full border-warning text-warning hover:bg-warning/10"
              onClick={() => setShowLockConfirm(true)}
            >
              Lock Group
            </Button>
          )}

          <Button
            variant="danger"
            className="w-full"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Group
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showLockConfirm}
        onClose={() => setShowLockConfirm(false)}
        onConfirm={handleLock}
        title="Lock Group"
        message="Locking this group will prevent new expenses from being added. This action cannot be undone easily."
        confirmLabel="Lock Group"
        isLoading={isLocking}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Group"
        message="This will permanently delete the group and all its data. This action cannot be undone."
        confirmLabel="Delete Group"
        isLoading={isDeleting}
      />
    </>
  );
}
