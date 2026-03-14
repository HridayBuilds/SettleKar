import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { createSettlement } from '../../api/settlements';
import { createPaymentOrder, verifyPayment } from '../../api/payments';
import { cn } from '../../lib/utils';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CreateSettlementModal({
  isOpen,
  onClose,
  groupId,
  prefill,
  members = [],
  onSuccess,
}) {
  const [method, setMethod] = useState('MANUAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (prefill) {
        setValue('payerId', prefill.payerId || '');
        setValue('receiverId', prefill.receiverId || '');
        setValue('amount', prefill.amount || '');
      } else {
        reset();
      }
      setMethod('MANUAL');
    }
  }, [isOpen, prefill, setValue, reset]);

  const memberOptions = members.map((m) => ({
    value: m.userId || m.id,
    label: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.username,
  }));

  const onSubmit = async (data) => {
    if (data.payerId === data.receiverId) {
      toast.error('Payer and receiver must be different');
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = parseFloat(data.amount);
      const res = await createSettlement(groupId, {
        payerId: data.payerId,
        receiverId: data.receiverId,
        amount,
        method,
        notes: data.notes || '',
      });

      const settlementId = res.data?.id;

      if (method === 'RAZORPAY' && settlementId) {
        toast.success('Settlement created. Opening Razorpay...');
        // Close modal first, then open Razorpay
        onClose();

        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway. Check your connection.');
          onSuccessRef.current?.();
          return;
        }

        // Create payment order
        const paymentRes = await createPaymentOrder(settlementId);
        const orderData = paymentRes.data;

        // Open Razorpay checkout
        const options = {
          key: orderData.razorpayKeyId,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'SettleKar',
          description: 'Settlement Payment',
          order_id: orderData.razorpayOrderId,
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success('Payment successful!');
              onSuccessRef.current?.();
            } catch {
              toast.error('Payment verification failed');
            }
          },
          theme: { color: '#2563EB' },
          modal: {
            ondismiss: () => {
              toast('Payment cancelled. You can pay later from the Settlements table.', { icon: 'ℹ️' });
              onSuccessRef.current?.();
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response) => {
          toast.error(response.error?.description || 'Payment failed');
        });
        razorpay.open();
      } else {
        toast.success('Settlement created');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Settlement/Payment error:', err);
      toast.error(err.response?.data?.message || 'Failed to create settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Settlement">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Payer"
          placeholder="Select payer"
          options={memberOptions}
          error={errors.payerId?.message}
          {...register('payerId', { required: 'Payer is required' })}
        />

        <Select
          label="Receiver"
          placeholder="Select receiver"
          options={memberOptions}
          error={errors.receiverId?.message}
          {...register('receiverId', { required: 'Receiver is required' })}
        />

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' },
          })}
        />

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
            Method
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod('MANUAL')}
              className={cn(
                'flex-1 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors',
                method === 'MANUAL'
                  ? 'border-accent bg-accent/10 text-accent-light'
                  : 'border-border bg-bg-elevated text-text-secondary hover:text-text-primary'
              )}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setMethod('RAZORPAY')}
              className={cn(
                'flex-1 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors',
                method === 'RAZORPAY'
                  ? 'border-accent bg-accent/10 text-accent-light'
                  : 'border-border bg-bg-elevated text-text-secondary hover:text-text-primary'
              )}
            >
              Razorpay
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-1.5">
            Notes
          </label>
          <textarea
            rows={3}
            placeholder="Add a note (optional)"
            className="w-full rounded-sm border border-border bg-bg-elevated px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none"
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {method === 'RAZORPAY' ? 'Create & Pay' : 'Create Settlement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
