'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buyerApi } from '@/lib/api-client';
import { getBuyerSession, saveBuyerSession, getBrowserFingerprint, getPurchaseToken } from '@/lib/buyer-session';

interface ContentData {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  contentType: string;
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [content, setContent] = useState<ContentData | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
            const fingerprint = await getBrowserFingerprint();
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
      } catch (err: any) {
        console.error('Failed to fetch content:', err);
        setError(err.response?.data?.message || 'Failed to load content');
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
      // Get or create session
      let session = getBuyerSession();
      if (!session) {
        // Try to create a new session
        try {
          const fingerprint = await getBrowserFingerprint();
          const response = await buyerApi.createSession({ fingerprint, email });
          session = response.data;
          if (session) {
            saveBuyerSession(session);
          } else {
            throw new Error('Failed to create session. Please refresh the page and try again.');
          }
        } catch (err) {
          console.error('Failed to create session:', err);
          throw new Error('Failed to create session. Please refresh the page and try again.');
        }
      }

      // Redirect to payment page with email
      router.push(`/checkout/${id}/payment?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to proceed to payment');
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
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Secure Checkout</span>
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
            </div>

            {/* Right Column - Checkout Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{content.title}</h1>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">${content.price.toFixed(2)}</div>
                </div>

                {content.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{content.description}</p>
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
                      We'll send your purchase receipt and access link to this email
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
                    className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Continue to Payment →'}
                  </button>

                  {/* Payment Info */}
                  <div className="space-y-2">
                    <p className="text-center text-xs sm:text-sm text-gray-500">
                      Secure payment • Instant access
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <span>Your payment is encrypted and secure.</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span className="text-xs font-medium text-gray-500">Stripe</span>
                      <span className="text-xs font-medium text-gray-500">VISA</span>
                      <span className="text-xs font-medium text-gray-500">Mastercard</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 sm:mt-12 flex items-center justify-between text-sm text-gray-500">
            <span>Questions? Contact support</span>
            <Link href={`/c/${id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
              ← Back to content
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
