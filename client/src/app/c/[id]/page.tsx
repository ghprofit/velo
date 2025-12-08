'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { buyerApi } from '@/lib/api-client';
import { getBuyerSession, saveBuyerSession, getBrowserFingerprint, getPurchaseToken, savePurchaseToken } from '@/lib/buyer-session';

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
    bio?: string;
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

export default function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [content, setContent] = useState<ContentData | null>(null);
  const [purchasedContent, setPurchasedContent] = useState<PurchasedContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      let session = getBuyerSession();

      if (!session) {
        try {
          const fingerprint = await getBrowserFingerprint();
          const response = await buyerApi.createSession({ fingerprint });
          session = response.data;
          saveBuyerSession(session);
        } catch (err) {
          console.error('Failed to create session:', err);
        }
      }

      if (session) {
        setSessionToken(session.sessionToken);
      }
    };

    const loadContent = async () => {
      try {
        setLoading(true);

        // Check if user has access token (from URL or localStorage)
        const accessToken = tokenFromUrl || getPurchaseToken(id);

        if (accessToken) {
          // Save token if from URL
          if (tokenFromUrl) {
            savePurchaseToken(id, tokenFromUrl);
          }

          // Fetch purchased content with access
          const response = await buyerApi.getContentAccess(accessToken);
          setPurchasedContent(response.data.content);
          setIsPurchased(true);
        } else {
          // Fetch preview content
          const response = await buyerApi.getContentDetails(id);
          setContent(response.data);
          setIsPurchased(false);
        }

        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch content:', err);
        setError(err.response?.data?.message || 'Failed to load content');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The content you\'re looking for doesn\'t exist or is no longer available.'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // Render purchased content view
  if (isPurchased && purchasedContent) {
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
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-green-700">PURCHASED</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-gray-50 min-h-screen pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Video/Content Player */}
            <div className="mb-6">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl aspect-video">
                {/* Placeholder for actual video player - you would integrate your preferred video player here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <p className="text-lg font-semibold">Content Player</p>
                    <p className="text-sm text-gray-300 mt-2">Integrate your video/content player here</p>
                    <p className="text-xs text-gray-400 mt-4">Content Type: {purchasedContent.contentType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{purchasedContent.title}</h1>
              {purchasedContent.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">{purchasedContent.description}</p>
              )}

              {/* Creator Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  {purchasedContent.creator.profileImage ? (
                    <img
                      src={purchasedContent.creator.profileImage}
                      alt={purchasedContent.creator.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                      {purchasedContent.creator.displayName[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{purchasedContent.creator.displayName}</span>
                    {purchasedContent.creator.verificationStatus === 'VERIFIED' && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Creator</p>
                </div>
              </div>
            </div>

            {/* Access Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
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
      </>
    );
  }

  // Render preview/purchase view
  if (!isPurchased && content) {
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
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-gray-50 min-h-screen py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Preview */}
              <div>
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl aspect-video">
                  <img
                    src={content.thumbnailUrl || 'https://via.placeholder.com/1280x720?text=Content+Preview'}
                    alt={content.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                      <p className="text-white text-lg font-semibold">Preview Only</p>
                      <p className="text-white/80 text-sm">Purchase to unlock full content</p>
                    </div>
                  </div>
                  {content.duration && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <span className="text-white text-sm font-medium">{formatDuration(content.duration)}</span>
                    </div>
                  )}
                </div>

                {/* Creator Info */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    {content.creator.profileImage ? (
                      <img
                        src={content.creator.profileImage}
                        alt={content.creator.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                        {content.creator.displayName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{content.creator.displayName}</h3>
                      {content.creator.verificationStatus === 'VERIFIED' && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {content.creator.bio && (
                      <p className="text-sm text-gray-600 mt-1">{content.creator.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Purchase */}
              <div>
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>

                  {content.description && (
                    <p className="text-gray-600 mb-6 leading-relaxed">{content.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{content.viewCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Views</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{content.purchaseCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Purchases</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 uppercase">{content.contentType}</div>
                    </div>
                  </div>

                  {/* Price & Purchase */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl font-bold text-gray-900">${content.price.toFixed(2)}</span>
                      <span className="text-gray-500">one-time purchase</span>
                    </div>

                    <button
                      onClick={handlePurchase}
                      className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
                    >
                      Purchase Now
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-4">
                      Secure payment • Instant access • Lifetime ownership
                    </p>
                  </div>

                  {/* What's Included */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Instant access to full content</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">High-quality streaming</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Lifetime access</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Secure & protected content</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return null;
}
