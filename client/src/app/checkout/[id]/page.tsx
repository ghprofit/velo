'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buyerApi } from '@/lib/api-client';
import { getBuyerSession, getPurchaseToken } from '@/lib/buyer-session';

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
      router.push(`/view/${id}?token=${accessToken}`);
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
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

    fetchContent();
  }, [id, router]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !content) return;

    setIsProcessing(true);
    setError(null);

    try {
      const session = getBuyerSession();
      if (!session) {
        throw new Error('No session found');
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
          <span className="text-sm text-gray-500">Secure Checkout</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
            <p className="text-gray-600">Enter your email to receive purchase confirmation and access details</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Order Summary */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="flex items-center gap-4">
                <img
                  src={content.thumbnailUrl || 'https://via.placeholder.com/120x80'}
                  alt={content.title}
                  className="w-24 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{content.title}</h3>
                  <p className="text-sm text-gray-500">{content.contentType}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${content.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleContinue} className="p-6">
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="your@email.com"
                />
                <p className="mt-2 text-sm text-gray-500">
                  We'll send your purchase receipt and access link to this email
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Link
                  href={`/c/${id}`}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Go Back
                </Link>
                <button
                  type="submit"
                  disabled={isProcessing || !email}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
