'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { buyerApi } from '@/lib/api-client';
import { getBuyerSession, saveBuyerSession, getBrowserFingerprint, getPurchaseToken, savePurchaseToken } from '@/lib/buyer-session';
import Footer from '@/components/Footer';

interface ContentData {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  contentType: string;
  duration?: number;
  viewCount: number;
  purchaseCount: number;
  creator: {
    id: string;
    displayName: string;
    profileImage?: string;
    verificationStatus: string;
  };
}

interface PurchasedContentData extends ContentData {
  s3Key: string;
  s3Bucket: string;
  contentItems: Array<{
    id: string;
    s3Key: string;
    s3Bucket: string;
    order: number;
  }>;
}

export function ContentClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [content, setContent] = useState<ContentData | null>(null);
  const [purchasedContent, setPurchasedContent] = useState<PurchasedContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);

  // Device verification states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentFingerprint, setCurrentFingerprint] = useState<string | null>(null);
  const [accessEligibility, setAccessEligibility] = useState<any>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
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
    };

    const loadContent = async () => {
      try {
        setLoading(true);

        // Get fingerprint FIRST
        const fingerprint = await getBrowserFingerprint();
        setCurrentFingerprint(fingerprint);

        // Check if user has access token (from URL or localStorage)
        const accessToken = tokenFromUrl || getPurchaseToken(id);

        if (accessToken) {
          // Save token if from URL
          if (tokenFromUrl) {
            savePurchaseToken(id, tokenFromUrl);
          }

          // Check eligibility BEFORE fetching content
          const eligibilityResponse = await buyerApi.checkAccessEligibility(accessToken, fingerprint);
          const eligibility = eligibilityResponse.data;
          setAccessEligibility(eligibility);

          if (eligibility.hasAccess) {
            // Fetch content with fingerprint
            const response = await buyerApi.getContentAccess(accessToken, fingerprint);
            setPurchasedContent(response.data.content);
            setIsPurchased(true);
          } else if (eligibility.needsEmailVerification) {
            setError(eligibility.reason);
            setShowVerificationModal(true);
          } else if (eligibility.isExpired) {
            setError(eligibility.reason);
            setIsPurchased(false);
          } else {
            setError(eligibility.reason || 'Access denied');
            setIsPurchased(false);
          }
        } else {
          // Fetch preview content
          const response = await buyerApi.getContentDetails(id);
          setContent(response.data);
          setIsPurchased(false);
        }
      } catch (err: any) {
        console.error('Failed to fetch content:', err);
        setError(err.response?.data?.message || 'Failed to load content');
        setIsPurchased(false);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
    loadContent();
  }, [id, tokenFromUrl]);

  const handlePurchase = () => {
    router.push(`/checkout/${id}`);
  };

  const handleRequestVerification = async () => {
    if (!verificationEmail || !currentFingerprint) {
      setVerificationError('Email is required');
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationError(null);
      const accessToken = tokenFromUrl || getPurchaseToken(id);

      if (!accessToken) {
        setVerificationError('Access token not found');
        return;
      }

      await buyerApi.requestDeviceVerification({
        accessToken,
        fingerprint: currentFingerprint,
        email: verificationEmail,
      });

      alert('Verification code sent to your email!');
    } catch (err: any) {
      console.error('Failed to request verification:', err);
      setVerificationError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !currentFingerprint) {
      setVerificationError('Verification code is required');
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationError(null);
      const accessToken = tokenFromUrl || getPurchaseToken(id);

      if (!accessToken) {
        setVerificationError('Access token not found');
        return;
      }

      await buyerApi.verifyDeviceCode({
        accessToken,
        fingerprint: currentFingerprint,
        verificationCode,
      });

      setShowVerificationModal(false);
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to verify code:', err);
      setVerificationError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || (!content && !purchasedContent)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 flex flex-col">
        {/* Error Content */}
        <div className="h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-lg mx-auto">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl opacity-60"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-8 shadow-2xl ring-1 ring-white/20">
                <img
                  src="/assets/logo_svgs/Secondary_Logo(white).svg"
                  alt="Velo Link"
                  className="h-16 w-auto mx-auto"
                />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Content Not Found</h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              {error || 'Content not found'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Back Home
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 shadow-md hover:shadow-lg border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Get Help
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Render purchased content view
  if (isPurchased && purchasedContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/logo_svgs/Primary_Logo(black).svg"
                alt="Velo Link"
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-green-700">PURCHASED</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Expiration Timer */}
            {accessEligibility?.accessExpiresAt && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Time-Limited Access</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Expires: {new Date(accessEligibility.accessExpiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Video/Content Player */}
            <div className="mb-6">
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl aspect-video ring-1 ring-gray-200">
                {/* Placeholder for actual video player */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-30"></div>
                      <svg className="relative w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <p className="text-xl font-semibold mb-2">Content Player</p>
                    <p className="text-sm text-gray-300 mb-4">Integrate your video/content player here</p>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-xs text-gray-300">Content Type: {purchasedContent.contentType}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 ring-1 ring-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{purchasedContent.title}</h1>
              {purchasedContent.description && (
                <p className="text-gray-600 text-lg leading-relaxed">{purchasedContent.description}</p>
              )}
            </div>

            {/* Access Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">You have lifetime access to this content</p>
                  <p className="text-xs text-blue-700 mt-1">Bookmark this page to return anytime</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Render preview/purchase view
  if (!isPurchased && content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/logo_svgs/Primary_Logo(black).svg"
                alt="Velo Link"
                className="h-7 sm:h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Secure Checkout</span>
              <span className="hidden md:inline text-gray-400">•</span>
              <span className="text-xs sm:text-sm text-gray-500 hidden md:inline">Encrypted</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-4 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Mobile Title - Shows above thumbnail on mobile only */}
            <div className="lg:hidden mb-4">
              <h1 className="text-xl font-bold text-gray-900 px-2">{content.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
              {/* Left Column - Preview */}
              <div className="space-y-6">
                <div className="relative bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200 aspect-video">
                  <img
                    src={content.thumbnailUrl || 'https://via.placeholder.com/1280x720?text=Content+Preview'}
                    alt={content.title}
                    className="w-full h-full object-cover blur-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-2xl">
                      <div className="flex items-center gap-3">
                        <img
                          src="/assets/logo_svgs/Brand_Icon(black).svg"
                          alt="Lock"
                          className="w-7 h-7"
                        />
                        <span className="text-gray-900 font-bold text-lg">Locked Content</span>
                      </div>
                    </div>
                  </div>
                  {content.duration && (
                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                      <span className="text-white text-sm font-medium">{formatDuration(content.duration)}</span>
                    </div>
                  )}
                </div>

                {/* Features Grid - Desktop */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Secure</p>
                        <p className="text-xs text-gray-500">256-bit encryption</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Purchase */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 sm:p-8">
                  <h1 className="hidden lg:block text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{content.title}</h1>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ${(content.price * 1.10).toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm">one-time</span>
                    </div>
                  </div>

                  {content.description && (
                    <p className="hidden sm:block text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{content.description}</p>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={handlePurchase}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Unlock Content Now
                  </button>

                  {/* Payment Info */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Secure payment • Instant access</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <img src="https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=white" alt="Stripe" className="h-5" />
                      <span className="text-xs font-medium text-gray-400">•</span>
                      <span className="text-xs font-medium text-gray-500">VISA</span>
                      <span className="text-xs font-medium text-gray-500">Mastercard</span>
                      <span className="text-xs font-medium text-gray-500">Apple Pay</span>
                    </div>
                  </div>
                </div>

                {/* Content Type Badge - Desktop */}
                <div className="hidden lg:flex items-center justify-center gap-2 bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide px-4 py-2 bg-indigo-50 rounded-full">
                    {content.contentType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Verification Modal
  if (showVerificationModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify New Device</h2>
          <p className="text-gray-600 mb-6">
            To access this content from a new device, please verify your email address.
          </p>

          {verificationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{verificationError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={verificationEmail}
                onChange={(e) => setVerificationEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={verificationLoading}
              />
            </div>

            <button
              onClick={handleRequestVerification}
              disabled={verificationLoading || !verificationEmail}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {verificationLoading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Enter code below</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={verificationLoading}
              />
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={verificationLoading || !verificationCode}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {verificationLoading ? 'Verifying...' : 'Verify Device'}
            </button>

            <button
              onClick={() => setShowVerificationModal(false)}
              className="w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              disabled={verificationLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
