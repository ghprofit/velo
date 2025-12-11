'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { buyerApi, stripeApi } from '@/lib/api-client';
import { getBuyerSession, saveBuyerSession, getBrowserFingerprint, savePurchaseToken } from '@/lib/buyer-session';
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

        // Get or create buyer session
        let session = getBuyerSession();
        if (!session) {
          try {
            const fingerprint = await getBrowserFingerprint();
            const response = await buyerApi.createSession({ fingerprint });
            session = response.data;
            if (session) {
              saveBuyerSession(session);
            } else {
              throw new Error('No session found');
            }
          } catch (err) {
            console.error('Failed to create session:', err);
            throw new Error('No session found');
          }
        }

        // Create purchase and get client secret
        const purchaseResponse = await buyerApi.createPurchase({
          contentId: id,
          sessionToken: session.sessionToken,
          email: email || undefined,
        });

        if (purchaseResponse.data.alreadyPurchased) {
          // Already purchased, redirect to content view
          savePurchaseToken(id, purchaseResponse.data.accessToken);
          router.push(`/c/${id}?token=${purchaseResponse.data.accessToken}`);
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

  const handlePaymentSuccess = async (purchaseId: string, accessToken: string, paymentIntentId: string) => {
    try {
      // Confirm the purchase with the backend
      await buyerApi.confirmPurchase({
        purchaseId,
        paymentIntentId,
      });

      // Save access token
      savePurchaseToken(id, accessToken);

      // Redirect to success page
      router.push(`/checkout/${id}/success?token=${accessToken}`);
    } catch (error) {
      console.error('Failed to confirm purchase:', error);
      // Even if confirmation fails, the webhook will handle it
      // So we can still redirect to success
      savePurchaseToken(id, accessToken);
      router.push(`/checkout/${id}/success?token=${accessToken}`);
    }
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

  const paymentElementOptions = {
    layout: {
      type: 'tabs' as const,
      defaultCollapsed: false,
    },
    wallets: {
      applePay: 'auto' as const,
      googlePay: 'auto' as const,
      amazonPay: 'auto' as const,
    },
    paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'amazon_pay', 'cashapp', 'link'],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo_svgs/Primary_Logo(black).svg"
              alt="Velo Link"
              className="h-7 sm:h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Secure Payment</span>
            <span className="hidden md:inline text-gray-400">•</span>
            <span className="text-xs sm:text-sm text-gray-500 hidden md:inline">End-to-end encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Left Column - Content Preview */}
            <div className="space-y-6">
              <div className="relative bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-sm aspect-video">
                <img
                  src={content.thumbnailUrl || 'https://via.placeholder.com/1280x720?text=Content+Preview'}
                  alt={content.title}
                  className="w-full h-full object-cover blur-sm"
                />
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <img
                        src="/assets/logo_svgs/Brand_Icon(black).svg"
                        alt="Lock"
                        className="w-6 h-6"
                      />
                      <span className="text-gray-900 font-semibold text-lg">Locked Content</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info - Desktop Only */}
              <div className="hidden lg:block bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Payment
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Powered by Stripe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{content.title}</h1>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900">${content.price.toFixed(2)}</div>
                      <p className="text-sm text-gray-500 mt-1">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
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
                        paymentElementOptions={paymentElementOptions}
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

                {/* Payment Info - Mobile */}
                <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      SSL Encrypted
                    </span>
                    <span>•</span>
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 sm:mt-12 flex items-center justify-between text-sm text-gray-500">
            <span>Questions? Contact support</span>
            <Link href={`/checkout/${id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
              ← Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
