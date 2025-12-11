'use client';

import { useState, FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  onSuccess: (purchaseId: string, accessToken: string, paymentIntentId: string) => void;
  onError: (error: string) => void;
  amount: number;
  paymentElementOptions?: any;
}

export default function CheckoutForm({ onSuccess, onError, amount, paymentElementOptions }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        const purchaseId = paymentIntent.metadata?.purchaseId || '';
        const accessToken = paymentIntent.metadata?.accessToken || '';
        onSuccess(purchaseId, accessToken, paymentIntent.id);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      onError(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <PaymentElement
          options={paymentElementOptions}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </span>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Your payment is secured with 256-bit encryption
        </p>
      </div>
    </form>
  );
}
