'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { buyerApi, stripeApi } from '@/lib/api-client';
import { getBuyerSession, savePurchaseToken } from '@/lib/buyer-session';
import CheckoutForm from '@/components/CheckoutForm';

interface ContentData {
  id: string;
  title: string;
  price: number;
  thumbnailUrl: string;
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseId, setPurchaseId] = useState<string>('');

  useEffect(() => {
    if (!email) {
      router.push(`/checkout/${id}`);
      return;
    }

    const initializePayment = async () => {
      try {
        setLoading(true);

        // Get Stripe publishable key
        const configResponse = await stripeApi.getConfig();
        const publishableKey = configResponse.data.publishableKey;
        setStripePromise(loadStripe(publishableKey));

        // Get content details
        const contentResponse = await buyerApi.getContentDetails(id);
        setContent(contentResponse.data);

        // Get buyer session
        const session = getBuyerSession();
        if (!session) {
          throw new Error('No session found');
        }

        // Create purchase and get client secret
        const purchaseResponse = await buyerApi.createPurchase({
          contentId: id,
          sessionToken: session.sessionToken,
          email: email || undefined,
        });

        if (purchaseResponse.data.alreadyPurchased) {
          // Already purchased, redirect to view
          savePurchaseToken(id, purchaseResponse.data.accessToken);
          router.push(`/view/${id}?token=${purchaseResponse.data.accessToken}`);
          return;
        }

        setClientSecret(purchaseResponse.data.clientSecret);
        setPurchaseId(purchaseResponse.data.purchaseId);
        setError(null);
      } catch (err: any) {
        console.error('Payment initialization error:', err);
        setError(err.response?.data?.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [id, email, router]);

  const handlePaymentSuccess = (purchaseId: string, accessToken: string) => {
    // Save access token
    savePurchaseToken(id, accessToken);

    // Redirect to success page
    router.push(`/checkout/${id}/success?token=${accessToken}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!email) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (error || !content || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Failed to initialize payment'}</p>
          <Link
            href={`/checkout/${id}`}
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#4f46e5',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo_svgs/Primary_Logo(black).svg"
              alt="Welo Link"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-gray-500">Secure Payment</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
            <p className="text-gray-600">Enter your payment details to unlock instant access</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            {/* Order Summary */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <img
                  src={content.thumbnailUrl || 'https://via.placeholder.com/120x80'}
                  alt={content.title}
                  className="w-24 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{content.title}</h3>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${content.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="p-6">
              {stripePromise && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance,
                  }}
                >
                  <CheckoutForm
                    amount={content.price}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
