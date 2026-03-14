import { useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { createPaymentOrder, verifyPayment } from '../../api/payments';

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

export function RazorpayButton({ settlementId, amount, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please check your connection.');
        setIsLoading(false);
        return;
      }

      const res = await createPaymentOrder(settlementId);
      const orderData = res.data;

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
            toast.success('Payment verified successfully!');
            onSuccess?.();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {},
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. You can pay later.', { icon: 'ℹ️' });
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed');
        setIsLoading(false);
      });
      razorpay.open();
      // Don't setIsLoading(false) here — Razorpay modal is open,
      // it will be reset in handler/ondismiss/payment.failed callbacks
    } catch (err) {
      console.error('Razorpay payment error:', err);
      toast.error(err.response?.data?.message || 'Failed to create payment order');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      isLoading={isLoading}
      icon={CreditCard}
      size="sm"
    >
      Pay with Razorpay
    </Button>
  );
}
