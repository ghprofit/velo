'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { buyerApi, stripeApi } from '@/lib/api-client';
import { getBuyerSession, getOrGenerateBrowserFingerprint, clearCachedBuyerFingerprint, savePurchaseToken } from '@/lib/buyer-session';
import CheckoutForm from '@/components/CheckoutForm';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/PageTransition';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useCurrencyCountUp } from '@/hooks/useCountUp';
import FloatingLogo from '@/components/FloatingLogo';

interface ContentData {
  id: string;
  title: string;
  price: number;
  thumbnailUrl: string;
}

interface PurchaseInfo {
  purchaseId: string;
  accessToken: string;
  clientSecret: string;
}

export function PaymentClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Prevent double initialization in React StrictMode
  const initializingRef = useRef(false);

  // Animated price count-ups
  const contentPriceAnimated = useCurrencyCountUp(content?.price || 0, '$', 1000);
  const platformFeeAnimated = useCurrencyCountUp((content?.price || 0) * 0.10, '$', 1000);
  const totalPriceAnimated = useCurrencyCountUp((content?.price || 0) * 1.10, '$', 1000);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!email) {
      router.push(`/checkout/${id}`);
      return;
    }

    // Prevent double initialization from React StrictMode
    if (initializingRef.current) {
      console.log('[CHECKOUT] ⏭️ Skipping duplicate initialization');
      return;
    }

    const initializePayment = async () => {
      console.log('[CHECKOUT] ========== PAYMENT INITIALIZATION STARTED ==========');
      console.log('[CHECKOUT] Content ID:', id);
      console.log('[CHECKOUT] Email:', email);

      try {
        initializingRef.current = true;
        setLoading(true);
        setError(null);

        // Validate session exists FIRST
        console.log('[CHECKOUT] Checking for buyer session...');
        const session = getBuyerSession();
        if (!session || !session.sessionToken) {
          console.error('[CHECKOUT] ❌ No valid session found');
          setError('Session expired. Redirecting to checkout...');
          setTimeout(() => {
            router.push(`/checkout/${id}`);
          }, 2000);
          return;
        }
        console.log('[CHECKOUT] ✅ Session found:', session.sessionToken.substring(0, 16) + '...');

        // Get Stripe publishable key
        console.log('[CHECKOUT] Fetching Stripe config...');
        const configResponse = await stripeApi.getConfig();
        const publishableKey = configResponse.data.publishableKey;
        console.log('[CHECKOUT] ✅ Stripe publishable key received');
        setStripePromise(loadStripe(publishableKey));

        // Get content details
        console.log('[CHECKOUT] Fetching content details...');
        const contentResponse = await buyerApi.getContentDetails(id);
        setContent(contentResponse.data);
        console.log('[CHECKOUT] ✅ Content details:', contentResponse.data.title);

        // Get browser fingerprint for device tracking (uses cached value from checkout page)
        console.log('[CHECKOUT] Getting browser fingerprint...');
        const fingerprint = await getOrGenerateBrowserFingerprint();
        console.log('[CHECKOUT] ✅ Fingerprint retrieved:', fingerprint);

        // Create purchase and get client secret
        console.log('[CHECKOUT] Creating purchase...');
        console.log('[CHECKOUT] Request payload:', {
          contentId: id,
          sessionToken: session.sessionToken.substring(0, 16) + '...',
          email: email || 'not provided',
          fingerprint
        });

        const purchaseResponse = await buyerApi.createPurchase({
          contentId: id,
          sessionToken: session.sessionToken,
          email: email || undefined,
          fingerprint,
        });

        console.log('[CHECKOUT] ✅ Purchase created successfully!');
        console.log('[CHECKOUT] Purchase ID:', purchaseResponse.data.purchaseId);
        console.log('[CHECKOUT] Already purchased:', purchaseResponse.data.alreadyPurchased || false);

        if (purchaseResponse.data.alreadyPurchased) {
          // Already purchased, redirect to content view
          console.log('[CHECKOUT] Redirecting to content (already purchased)');
          savePurchaseToken(id, purchaseResponse.data.accessToken);
          router.push(`/c/${id}?token=${purchaseResponse.data.accessToken}`);
          return;
        }

        // Store purchase info in state (not relying on Stripe metadata)
        setPurchaseInfo({
          purchaseId: purchaseResponse.data.purchaseId,
          accessToken: purchaseResponse.data.accessToken,
          clientSecret: purchaseResponse.data.clientSecret,
        });

        console.log('[CHECKOUT] ========== PAYMENT INITIALIZATION COMPLETE ==========');
        setError(null);
      } catch (err: unknown) {
        console.error('[CHECKOUT] ❌ ========== PAYMENT INITIALIZATION FAILED ==========');
        console.error('[CHECKOUT] Error:', err);
        const error = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
        initializingRef.current = false; // Reset on error to allow retry
        console.error('[CHECKOUT] Error response:', error.response?.data);
        console.error('[CHECKOUT] Error message:', error.message);
        console.error('[CHECKOUT] HTTP status:', (error as { response?: { status?: number } }).response?.status);

        const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize payment';
        console.error('[CHECKOUT] Displaying error to user:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [id, email, router]);

  const handlePaymentSuccess = async (
    purchaseId: string,
    accessToken: string,
    paymentIntentId: string
  ) => {
    try {
      console.log('[PAYMENT] Confirming purchase with backend...');
      console.log('[PAYMENT] Purchase ID:', purchaseId);
      console.log('[PAYMENT] Purchase ID type:', typeof purchaseId);
      console.log('[PAYMENT] Payment Intent ID:', paymentIntentId);
      console.log('[PAYMENT] Payment Intent ID type:', typeof paymentIntentId);
      
      const requestData = {
        purchaseId,
        paymentIntentId,
      };
      console.log('[PAYMENT] Request data being sent:', JSON.stringify(requestData, null, 2));
      
      // Confirm the purchase with the backend
      const result = await buyerApi.confirmPurchase(requestData);

      console.log('[PAYMENT] ✅ Purchase confirmed:', result.data);
      console.log('[PAYMENT] Confirmed access token:', result.data.accessToken);
      console.log('[PAYMENT] Confirmed status:', result.data.status);

      // Only proceed if confirmation succeeded
      if (result.data.status === 'COMPLETED') {
        // Use the confirmed access token from the response (most reliable)
        const confirmedToken = result.data.accessToken;
        
        console.log('[PAYMENT] 💾 Saving purchase token to localStorage...');
        // Clear the cached fingerprint after successful purchase
        clearCachedBuyerFingerprint();
        
        // Save the confirmed token
        savePurchaseToken(id, confirmedToken);
        console.log('[PAYMENT] ✅ Token saved successfully');
        
        console.log('[PAYMENT] 🔄 Redirecting to success page...');
        router.push(`/checkout/${id}/success?token=${confirmedToken}`);
      } else {
        throw new Error('Purchase confirmation incomplete');
      }
    } catch (error) {
      console.error('[PAYMENT] ❌ Failed to confirm purchase:', error);
      const err = error as { response?: { data?: { message?: string; error?: any; statusCode?: number }; status?: number }; message?: string };
      console.error('[PAYMENT] Error response data:', JSON.stringify(err.response?.data, null, 2));
      console.error('[PAYMENT] Error response status:', err.response?.status);
      console.error('[PAYMENT] Error message:', err.message);

      // Show error instead of silently continuing
      setError(
        `Payment processed but verification failed: ${err.response?.data?.message || err.message || 'Unknown error'}. Please contact support with your payment confirmation. Your access token has been saved.`
      );

      console.log('[PAYMENT] ⚠️ Error occurred, but saving token anyway for webhook processing...');
      // Clear cached fingerprint even on error (purchase attempted)
      clearCachedBuyerFingerprint();

      // Save token anyway (webhook will handle completion)
      // Use the original token since confirmation failed
      savePurchaseToken(id, accessToken);
      console.log('[PAYMENT] ✅ Token saved (fallback)');

      // Show error for 5 seconds then redirect to success page
      setTimeout(() => {
        console.log('[PAYMENT] 🔄 Redirecting to success page after error...');
        router.push(`/checkout/${id}/success?token=${accessToken}`);
      }, 5000);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment failed:', errorMessage);
    // Redirect to the payment failed page
    router.push(`/checkout/${id}/failed`);
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

  if (error || !content || !purchaseInfo?.clientSecret) {
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
      type: (isMobile ? 'accordion' : 'tabs') as 'accordion' | 'tabs',
      defaultCollapsed: isMobile, // Collapse all payment methods on mobile by default
      radios: isMobile,
      spacedAccordionItems: isMobile,
    },
    wallets: {
      applePay: 'auto' as const,
      googlePay: 'auto' as const,
      amazonPay: 'auto' as const,
    },
    paymentMethodOrder: ['card', 'wechat_pay', 'apple_pay', 'google_pay', 'amazon_pay', 'cashapp', 'link'],
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col relative">
      {/* Floating Brand Logo */}
      <FloatingLogo
        position="center"
        size={110}
        animation="rotate"
        opacity={0.06}
        zIndex={-1}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo_svgs/Primary_Logo(black).svg"
              alt="Velo Link"
              width={180}
              height={32}
              className="h-7 sm:h-8 w-auto"
            />
          </Link>
          <motion.div
            className="flex items-center gap-2 text-gray-600 bg-linear-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-full border border-green-200"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-green-700 hidden sm:inline">Secure Payment</span>
            <span className="hidden md:inline text-gray-400">•</span>
            <span className="text-xs sm:text-sm text-green-600 hidden md:inline">Encrypted</span>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Progress Indicator */}
          <motion.div
            className="mb-6 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Email</span>
              </div>
              <div className="w-12 h-0.5 bg-indigo-600"></div>
              <div className="flex items-center gap-2 text-indigo-600">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-200"></div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-bold">3</span>
                </div>
                <span className="text-sm font-medium hidden sm:inline">Access</span>
              </div>
            </div>
          </motion.div>

          {/* Mobile Title - Shows above thumbnail on mobile only */}
          <div className="lg:hidden mb-4">
            <h1 className="text-xl font-bold text-gray-900 px-2">{content.title}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Left Column - Content Preview */}
            <div className="space-y-6">
              <div className="relative bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 aspect-video">
                <Image
                  src={content.thumbnailUrl || 'https://via.placeholder.com/1280x720?text=Content+Preview'}
                  alt={content.title}
                  width={1280}
                  height={720}
                  className="w-full h-full object-cover blur-sm"
                />
                <div className="absolute inset-0 bg-linear-to-br from-black/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/assets/logo_svgs/Brand_Icon(black).svg"
                        alt="Lock"
                        width={28}
                        height={28}
                        className="w-7 h-7"
                      />
                      <span className="text-gray-900 font-bold text-lg">Locked Content</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info - Desktop Only */}
              <motion.div
                className="hidden lg:block bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm ring-1 ring-green-100"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-lg">Secure Payment</span>
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <motion.div
                    className="flex items-center gap-3 bg-white/50 rounded-lg p-3"
                    variants={staggerItem}
                  >
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">256-bit SSL encryption</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-3 bg-white/50 rounded-lg p-3"
                    variants={staggerItem}
                  >
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">PCI DSS compliant</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-3 bg-white/50 rounded-lg p-3"
                    variants={staggerItem}
                  >
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Powered by Stripe</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 sm:p-8">
                <h1 className="hidden lg:block text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{content.title}</h1>

                <div className="mb-6 flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-700 font-medium">{email}</p>
                </div>

                {/* Payment Form */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
                  {stripePromise && purchaseInfo.clientSecret && (
                    <Elements
                      key={purchaseInfo.clientSecret} // Force remount when clientSecret changes
                      stripe={stripePromise}
                      options={{
                        clientSecret: purchaseInfo.clientSecret,
                        appearance,
                      }}
                    >
                      <CheckoutForm
                        amount={content.price * 1.10}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        paymentElementOptions={paymentElementOptions}
                        purchaseId={purchaseInfo.purchaseId}
                        accessToken={purchaseInfo.accessToken}
                        contentId={id}
                      />
                    </Elements>
                  )}

                  {/* Price Breakdown */}
                  <div className="mt-6 pt-6 space-y-3 border-t border-gray-200">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Content Price:</span>
                      <span className="font-medium">{contentPriceAnimated}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Platform Fee (10%):</span>
                      <span className="font-medium">{platformFeeAnimated}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3"></div>
                    <motion.div
                      className="flex justify-between text-lg font-bold text-gray-900"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <span>Total:</span>
                      <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {totalPriceAnimated}
                      </span>
                    </motion.div>
                  </div>

                  {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Info - Mobile */}
                <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">SSL Encrypted</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium">PCI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
}
