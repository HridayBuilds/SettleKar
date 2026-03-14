import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ScanLine } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { SplitMethodToggle } from './SplitMethodToggle';
import { MemberBreakdownTable } from './MemberBreakdownTable';
import { ReceiptUpload } from './ReceiptUpload';
import { EXPENSE_CATEGORIES } from '../../lib/constants';
import { createExpense, uploadReceipt, scanReceipt } from '../../api/expenses';

const categoryOptions = Object.entries(EXPENSE_CATEGORIES).map(([value, { label }]) => ({
  value,
  label,
}));

export function AddExpenseModal({ isOpen, onClose, groupId, members = [], onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [splitMethod, setSplitMethod] = useState('EQUAL');
  const [shares, setShares] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: '',
      amount: '',
      paidByUserId: '',
      category: '',
    },
  });

  const watchedAmount = watch('amount');

  // Initialize shares when members or splitMethod change
  useEffect(() => {
    if (members.length === 0) return;
    const total = Number(watchedAmount) || 0;
    const equalShare = members.length > 0 ? Math.round((total / members.length) * 100) / 100 : 0;

    setShares(
      members.map((m) => ({
        userId: m.userId || m.id,
        shareAmount: splitMethod === 'EQUAL' ? equalShare : 0,
        sharePercentage: splitMethod === 'PERCENTAGE' ? Math.round((100 / members.length) * 10) / 10 : 0,
      }))
    );
  }, [members, splitMethod, watchedAmount]);

  const memberOptions = members.map((m) => ({
    value: m.userId || m.id,
    label: `${m.firstName} ${m.lastName}`,
  }));

  const handleScanReceipt = async () => {
    if (!receiptFile) return;
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await scanReceipt(receiptFile);
      const data = res.data;
      if (data.success) {
        if (data.description) setValue('description', data.description, { shouldValidate: true });
        if (data.amount != null) setValue('amount', data.amount, { shouldValidate: true });
        if (data.category) setValue('category', data.category, { shouldValidate: true });
        setScanResult(data);
        toast.success('Receipt scanned! Fields auto-filled.');
      } else {
        toast.error(data.error || 'Could not extract data from receipt');
      }
    } catch (err) {
      toast.error('Receipt scanning failed. Please fill in manually.');
    } finally {
      setIsScanning(false);
    }
  };

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
        receiptUrl: scanResult?.receiptUrl || undefined,
        shares: finalShares.map((s) => ({
          userId: s.userId,
          shareAmount: splitMethod === 'PERCENTAGE' ? (total * (s.sharePercentage || 0)) / 100 : s.shareAmount,
          sharePercentage: splitMethod === 'PERCENTAGE' ? (s.sharePercentage || 0) : undefined,
        })),
      };

      const res = await createExpense(groupId, payload);

      // Only upload receipt separately if it wasn't already uploaded during scan
      if (receiptFile && res.data?.id && !scanResult?.receiptUrl) {
        try {
          await uploadReceipt(groupId, res.data.id, receiptFile);
        } catch {
          toast.error('Expense created but receipt upload failed');
        }
      }

      toast.success('Expense added');
      reset();
      setSplitMethod('EQUAL');
      setReceiptFile(null);
      setScanResult(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSplitMethod('EQUAL');
    setReceiptFile(null);
    setScanResult(null);
    setIsScanning(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Expense" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <ReceiptUpload
            file={receiptFile}
            onFileSelect={(file) => {
              setReceiptFile(file);
              setScanResult(null);
            }}
          />
          {receiptFile && !scanResult && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={ScanLine}
              isLoading={isScanning}
              onClick={handleScanReceipt}
              className="mt-2 w-full"
            >
              {isScanning ? 'Scanning Receipt...' : 'Auto-fill from Receipt'}
            </Button>
          )}
          {scanResult?.success && (
            <p className="mt-2 text-xs font-medium text-green-500">
              Fields auto-filled from receipt. Review and edit as needed.
            </p>
          )}
        </div>

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
