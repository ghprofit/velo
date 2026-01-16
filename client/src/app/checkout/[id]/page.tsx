'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buyerApi } from '@/lib/api-client';
import { getBuyerSession, saveBuyerSession, getOrGenerateBrowserFingerprint, getPurchaseToken } from '@/lib/buyer-session';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/PageTransition';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import { useCurrencyCountUp } from '@/hooks/useCountUp';
import FloatingLogo from '@/components/FloatingLogo';

interface ContentData {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  contentType: string;
  itemCount?: number;
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [content, setContent] = useState<ContentData | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Animated price counts
  const contentPrice = useCurrencyCountUp(content?.price || 0, '$', 1000);
  const platformFee = useCurrencyCountUp((content?.price || 0) * 0.10, '$', 1000);
  const totalPrice = useCurrencyCountUp((content?.price || 0) * 1.10, '$', 1000);

  useEffect(() => {
    // Check if already purchased
    const accessToken = getPurchaseToken(id);
    if (accessToken) {
      router.push(`/c/${id}?token=${accessToken}`);
      return;
    }

    const initializeCheckout = async () => {
      try {
        setLoading(true);

        // Ensure session exists
        let session = getBuyerSession();
        if (!session) {
          try {
            const fingerprint = await getOrGenerateBrowserFingerprint();
            const response = await buyerApi.createSession({ fingerprint });
            session = response.data;
            if (session) {
              saveBuyerSession(session);
            }
          } catch (err) {
            console.error('Failed to create session:', err);
          }
        }

        // Fetch content details
        const response = await buyerApi.getContentDetails(id);
        setContent(response.data);
        setError(null);
      } catch (err: unknown) {
        console.error('Failed to fetch content:', err);
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [id, router]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !content) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Get or create session with retry logic
      let session = getBuyerSession();
      let retries = 0;

      while (!session && retries < 3) {
        try {
          const fingerprint = await getOrGenerateBrowserFingerprint();
          const response = await buyerApi.createSession({ fingerprint, email });
          session = response.data;

          if (session) {
            saveBuyerSession(session);
            // Add small delay to ensure storage completes
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify session was saved
            const savedSession = getBuyerSession();
            if (!savedSession) {
              throw new Error('Session not persisted');
            }
            break;
          }
        } catch (err) {
          retries++;
          console.error(`Session creation attempt ${retries} failed:`, err);
          if (retries >= 3) throw err;
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!session) {
        throw new Error('Failed to create session. Please try again.');
      }

      // Navigate only after session is confirmed
      router.push(`/checkout/${id}/payment?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const error = err as { message?: string };
      setError(error.message || 'Failed to proceed to payment');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/c/${id}`}
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-playful-1 flex flex-col relative">
      {/* Floating Brand Logos */}
      <FloatingLogo
        position="top-left"
        size={90}
        animation="float-rotate"
        opacity={0.10}
      />
      <FloatingLogo
        position="bottom-right"
        size={70}
        animation="pulse"
        opacity={0.08}
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
            className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </motion.svg>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Secure Checkout</span>
            <span className="hidden md:inline text-gray-400">•</span>
            <span className="text-xs sm:text-sm text-gray-500 hidden md:inline">Encrypted</span>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4 sm:py-8 lg:py-12">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Mobile Title - Shows above thumbnail on mobile only */}
          <motion.div variants={staggerItem} className="lg:hidden mb-4">
            <h1 className="text-xl font-bold text-gray-900 px-2">{content.title}</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Left Column - Content Preview */}
            <motion.div variants={staggerItem} className="space-y-6">
              <motion.div
                className="relative bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 aspect-video"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src={content.thumbnailUrl || 'https://via.placeholder.com/1280x720?text=Content+Preview'}
                  alt={content.title}
                  fill
                  className="object-cover blur-sm"
                />
                {/* Item Count Badge */}
                {content.itemCount && content.itemCount > 0 && (
                  <div className="z-10 absolute top-3 right-3 bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-semibold shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {content.itemCount} {content.itemCount === 1 ? 'item' : 'items'}
                  </div>
                )}
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
              </motion.div>

              {/* Features Grid - Desktop */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="hidden lg:grid grid-cols-2 gap-4"
              >
                <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 icon-3d-container icon-3d-indigo rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">Instant Access</p>
                      <p className="text-xs text-gray-500">Unlock immediately</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 icon-3d-container icon-3d-green rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">Secure</p>
                      <p className="text-xs text-gray-500">256-bit encryption</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Checkout Form */}
            <motion.div variants={staggerItem} className="space-y-6">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 sm:p-8">
                <h1 className="hidden lg:block text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{content.title}</h1>

                {content.description && (
                  <p className="hidden sm:block text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{content.description}</p>
                )}

                {/* Email Form */}
                <form onSubmit={handleContinue} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
                      placeholder="your@email.com"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      We&apos;ll send your purchase receipt and access link to this email
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing || !email}
                    className="w-full px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Content Price:</span>
                      <span className="font-medium">{contentPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Platform Fee (10%):</span>
                      <span className="font-medium">{platformFee}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3"></div>
                    <motion.div
                      className="flex justify-between text-lg font-bold text-gray-900"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <span>Total:</span>
                      <span className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {totalPrice}
                      </span>
                    </motion.div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Secure payment • Instant access</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 pt-1">
                      <Image src="https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=white" alt="Stripe" width={80} height={20} className="h-5" />
                      <span className="text-xs font-medium text-gray-400">•</span>
                      <span className="text-xs font-medium text-gray-500">VISA</span>
                      <span className="text-xs font-medium text-gray-500">Mastercard</span>
                      <span className="text-xs font-medium text-gray-500">Apple Pay</span>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
    </PageTransition>
  );
}
