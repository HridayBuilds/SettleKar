import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { SplitMethodToggle } from './SplitMethodToggle';
import { MemberBreakdownTable } from './MemberBreakdownTable';
import { ReceiptUpload } from './ReceiptUpload';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { updateExpense, uploadReceipt } from '../../api/expenses';

const categoryOptions = Object.entries(EXPENSE_CATEGORIES).map(([value, { label }]) => ({
  value,
  label,
}));

export function EditExpenseModal({ isOpen, onClose, groupId, expense, members = [], onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [splitMethod, setSplitMethod] = useState('EQUAL');
  const [shares, setShares] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const watchedAmount = watch('amount');

  // Pre-fill form when expense changes
  useEffect(() => {
    if (!expense) return;
    reset({
      description: expense.description || '',
      amount: expense.amount || '',
      paidByUserId: expense.paidByUserId || '',
      category: expense.category || '',
    });
    setSplitMethod(expense.splitMethod || 'EQUAL');

    if (expense.shares?.length > 0) {
      setShares(
        expense.shares.map((s) => ({
          userId: s.userId,
          shareAmount: s.shareAmount ?? 0,
          sharePercentage: s.sharePercentage ?? 0,
        }))
      );
    }
  }, [expense, reset]);

  // Recalculate shares on method / amount change
  useEffect(() => {
    if (!members.length || !expense) return;
    const total = Number(watchedAmount) || 0;

    if (splitMethod === 'EQUAL') {
      const equalShare = members.length > 0 ? Math.round((total / members.length) * 100) / 100 : 0;
      setShares(
        members.map((m) => ({
          userId: m.userId || m.id,
          shareAmount: equalShare,
          sharePercentage: 0,
        }))
      );
    }
  }, [splitMethod, watchedAmount, members, expense]);

  const memberOptions = members.map((m) => ({
    value: m.userId || m.id,
    label: `${m.firstName} ${m.lastName}`,
  }));

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const total = Number(data.amount);
      let finalShares = shares;

      if (splitMethod === 'EQUAL') {
        const equalShare = Math.round((total / members.length) * 100) / 100;
        finalShares = members.map((m) => ({
          userId: m.userId || m.id,
          shareAmount: equalShare,
        }));
      }

      const payload = {
        description: data.description,
        amount: total,
        paidByUserId: data.paidByUserId,
        category: data.category,
        splitMethod,
        shares: finalShares.map((s) => ({
          userId: s.userId,
          shareAmount: splitMethod === 'PERCENTAGE' ? (total * (s.sharePercentage || 0)) / 100 : s.shareAmount,
          sharePercentage: s.sharePercentage || undefined,
        })),
      };

      await updateExpense(groupId, expense.id, payload);

      if (receiptFile) {
        try {
          await uploadReceipt(groupId, expense.id, receiptFile);
        } catch {
          toast.error('Expense updated but receipt upload failed');
        }
      }

      toast.success('Expense updated');
      setReceiptFile(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReceiptFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Expense" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Description"
          placeholder="What was the expense for?"
          error={errors.description?.message}
          {...register('description', { required: 'Description is required' })}
        />

        <div className="relative">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            className="pl-10"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be positive' },
            })}
          />
          <span className="absolute left-3 top-[34px] text-sm text-text-muted">
            INR
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Paid By"
            placeholder="Select member"
            options={memberOptions}
            error={errors.paidByUserId?.message}
            {...register('paidByUserId', { required: 'Select who paid' })}
          />
          <Select
            label="Category"
            placeholder="Select category"
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category', { required: 'Category is required' })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
            Split Method
          </label>
          <SplitMethodToggle value={splitMethod} onChange={setSplitMethod} />
        </div>

        <MemberBreakdownTable
          members={members}
          splitMethod={splitMethod}
          totalAmount={watchedAmount}
          shares={shares}
          onChange={setShares}
        />

        <ReceiptUpload
          file={receiptFile}
          onFileSelect={setReceiptFile}
          existingReceiptUrl={expense?.receiptUrl}
        />

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
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
