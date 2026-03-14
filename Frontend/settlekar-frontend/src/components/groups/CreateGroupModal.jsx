import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { GROUP_TYPES } from '../../lib/constants';
import { createGroup } from '../../api/groups';

const typeOptions = Object.entries(GROUP_TYPES).map(([value, label]) => ({
  value,
  label,
}));

export function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: '',
      startDate: '',
      endDate: '',
      durationMonths: '',
      contributionAmount: '',
      budgetCap: '',
    },
  });

  const selectedType = watch('type');

  const showTravelEventFields =
    selectedType === 'TRAVEL' || selectedType === 'EVENT';
  const showHostelFields = selectedType === 'HOSTEL';

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        type: data.type,
      };

      if (showTravelEventFields) {
        if (data.startDate) payload.startDate = data.startDate;
        if (data.endDate) payload.endDate = data.endDate;
        if (data.budgetCap) payload.budgetCap = Number(data.budgetCap);
      }

      if (showHostelFields) {
        if (data.durationMonths)
          payload.durationMonths = Number(data.durationMonths);
        if (data.contributionAmount)
          payload.contributionAmount = Number(data.contributionAmount);
      }

      await createGroup(payload);
      toast.success('Group created successfully');
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Group">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="Enter group name"
          error={errors.name?.message}
          {...register('name', { required: 'Group name is required' })}
        />

        <Input
          label="Description"
          placeholder="Brief description (optional)"
          {...register('description')}
        />

        <Select
          label="Type"
          placeholder="Select group type"
          options={typeOptions}
          error={errors.type?.message}
          {...register('type', { required: 'Group type is required' })}
        />

        {showTravelEventFields && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                {...register('startDate')}
              />
              <Input
                label="End Date"
                type="date"
                {...register('endDate')}
              />
            </div>
            <Input
              label="Budget Cap (INR)"
              type="number"
              placeholder="0.00"
              {...register('budgetCap')}
            />
          </>
        )}

        {showHostelFields && (
          <>
            <Input
              label="Duration (Months)"
              type="number"
              placeholder="e.g. 12"
              {...register('durationMonths')}
            />
            <Input
              label="Contribution Amount (INR)"
              type="number"
              placeholder="0.00"
              {...register('contributionAmount')}
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
