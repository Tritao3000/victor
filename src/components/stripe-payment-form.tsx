'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useTranslations } from 'next-intl';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  clientSecret: string;
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

function CheckoutForm({ bookingId, amount, onSuccess, onBack }: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('BookWizard');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message ?? t('paymentError'));
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-charcoal">{t('stepPayTitle')}</h2>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex justify-between border-b border-fog pb-3">
          <span className="text-sm text-slate">{t('totalToPay')}</span>
          <span className="text-lg font-bold text-navy">€{amount.toFixed(2)}</span>
        </div>
        <PaymentElement />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="inline-flex items-center rounded-md border border-fog px-4 py-2 text-sm font-medium text-slate hover:bg-mist disabled:opacity-50"
        >
          {t('back')}
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="rounded-md bg-navy px-8 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-storm"
        >
          {isProcessing ? t('processing') : t('payNow')}
        </button>
      </div>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, bookingId, amount, onSuccess, onBack }: PaymentFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1B2A4A',
          },
        },
      }}
    >
      <CheckoutForm
        bookingId={bookingId}
        amount={amount}
        onSuccess={onSuccess}
        onBack={onBack}
      />
    </Elements>
  );
}
