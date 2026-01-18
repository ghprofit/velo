'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { buyerApi } from '@/lib/api-client';
import { getBuyerSession, saveBuyerSession, getBrowserFingerprint, getPurchaseToken, savePurchaseToken } from '@/lib/buyer-session';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { buttonTap } from '@/lib/animations';
import FloatingLogo from '@/components/FloatingLogo';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

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
  contentItems?: Array<{
    id: string;
    s3Key: string;
    s3Bucket: string;
    order: number;
    signedUrl: string;
  }>;
}

interface AccessEligibility {
  accessExpiresAt?: string;
  s3Bucket?: string;
  contentItems?: Array<{
    id: string;
    s3Key: string;
    s3Bucket: string;
    order: number;
    signedUrl?: string;
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
  const [accessEligibility, setAccessEligibility] = useState<AccessEligibility | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);


  // Lightbox state for gallery items
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
          let eligibilityResponse = await buyerApi.checkAccessEligibility(accessToken, fingerprint);
          let eligibility = eligibilityResponse.data;
          console.log('[CONTENT] Access eligibility check:', eligibility);
          
          // If purchase is still PENDING, retry after a short delay (database consistency issue)
          if (eligibility.reason?.includes('status is PENDING')) {
            console.log('[CONTENT] ⏳ Purchase still PENDING, retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            eligibilityResponse = await buyerApi.checkAccessEligibility(accessToken, fingerprint);
            eligibility = eligibilityResponse.data;
            console.log('[CONTENT] Retry eligibility check:', eligibility);
          }
          
          setAccessEligibility(eligibility);

          if (eligibility.hasAccess) {
            console.log('[CONTENT] ✅ Access granted, fetching content...');
            // Fetch content with fingerprint
            const response = await buyerApi.getContentAccess(accessToken, fingerprint);
            setPurchasedContent(response.data.content);
            setIsPurchased(true);
          } else if (eligibility.needsEmailVerification) {
            console.log('[CONTENT] ⚠️ Needs email verification');
            setError(eligibility.reason);
            setShowVerificationModal(true);
          } else if (eligibility.isExpired) {
            console.log('[CONTENT] ⏰ Access expired');
            setError(eligibility.reason);
            setIsPurchased(false);
          } else {
            console.log('[CONTENT] ❌ Access denied:', eligibility.reason);
            setError(eligibility.reason || 'Access denied');
            setIsPurchased(false);
          }
        } else {
          // Fetch preview content
          const response = await buyerApi.getContentDetails(id);
          setContent(response.data);
          setIsPurchased(false);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch content:', err);
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to load content');
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
    } catch (err: unknown) {
      console.error('Failed to request verification:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setVerificationError(error.response?.data?.message || 'Failed to send verification code');
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
    } catch (err: unknown) {
      console.error('Failed to verify code:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setVerificationError(error.response?.data?.message || 'Invalid verification code');
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
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-indigo-950 to-purple-950 flex flex-col">
        {/* Error Content */}
        <div className="h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-lg mx-auto">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl opacity-60"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-8 shadow-2xl ring-1 ring-white/20">
                <Image
                  src="/assets/logo_svgs/Secondary_Logo(white).svg"
                  alt="Velo Link"
                  width={180}
                  height={64}
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
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Back Home
              </Link>
              <Link
                href="/creator/help"
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

  // Helper function to detect actual file type from S3 key
  const getActualFileType = (s3Key: string): 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'UNKNOWN' => {
    const extension = s3Key.split('.').pop()?.toLowerCase();
    
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
    
    if (!extension) return 'UNKNOWN';
    
    if (videoExtensions.includes(extension)) return 'VIDEO';
    if (imageExtensions.includes(extension)) return 'IMAGE';
    if (documentExtensions.includes(extension)) return 'DOCUMENT';
    if (audioExtensions.includes(extension)) return 'AUDIO';
    
    return 'UNKNOWN';
  };

  // Render purchased content view
  if (isPurchased && purchasedContent) {
    console.log('[CONTENT] Rendering purchased content view');
    console.log('[CONTENT] Purchased content data:', JSON.stringify(purchasedContent, null, 2));
    console.log('[CONTENT] Content type:', purchasedContent.contentType);
    console.log('[CONTENT] Content items:', purchasedContent.contentItems);
    console.log('[CONTENT] First content item signedUrl:', purchasedContent.contentItems?.[0]?.signedUrl);
    
    // Detect actual file type from the first content item
    const firstItem = purchasedContent.contentItems?.[0];
    const actualFileType = firstItem ? getActualFileType(firstItem.s3Key) : 'UNKNOWN';
    const effectiveContentType = actualFileType !== 'UNKNOWN' ? actualFileType : purchasedContent.contentType;
    
    console.log('[CONTENT] Declared content type:', purchasedContent.contentType);
    console.log('[CONTENT] Detected file type:', actualFileType);
    console.log('[CONTENT] Effective content type:', effectiveContentType);
    
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-indigo-50/30 flex flex-col relative">
        {/* Floating Brand Logo */}
        <FloatingLogo
          position="top-right"
          size={120}
          animation="float-rotate"
          opacity={0.08}
        />
        <FloatingLogo
          position="bottom-left"
          size={100}
          animation="pulse"
          opacity={0.06}
        />

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo_svgs/Primary_Logo(black).svg"
                alt="Velo Link"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2 bg-linear-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
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
              <div className="bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="relative bg-linear-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
                {/* Render based on ACTUAL file type (detected from extension) */}
                {/* GALLERY: Show all items in a grid */}
                {purchasedContent.contentType === 'GALLERY' && purchasedContent.contentItems && purchasedContent.contentItems.length > 1 ? (
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {purchasedContent.contentItems.map((item, index) => {
                        const itemFileType = getActualFileType(item.s3Key);
                        return (
                          <div 
                            key={item.id} 
                            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group relative"
                            onClick={() => {
                              setLightboxIndex(index);
                              setLightboxOpen(true);
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            {itemFileType === 'VIDEO' && item.signedUrl && (
                              <div className="relative aspect-video">
                                <video
                                  className="w-full h-full object-contain pointer-events-none"
                                  preload="metadata"
                                  onContextMenu={(e) => e.preventDefault()}
                                >
                                  <source src={item.signedUrl} type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            {itemFileType === 'IMAGE' && item.signedUrl && (
                              <div className="relative aspect-video">
                                <Image
                                  src={item.signedUrl}
                                  alt={`${purchasedContent.title} - Image ${index + 1}`}
                                  fill
                                  className="object-contain pointer-events-none select-none"
                                  sizes="(max-width: 640px) 100vw, 50vw"
                                  draggable={false}
                                  onContextMenu={(e) => e.preventDefault()}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            {itemFileType === 'AUDIO' && item.signedUrl && (
                              <div className="p-4">
                                <audio controls className="w-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                  <source src={item.signedUrl} type="audio/mpeg" />
                                  Your browser does not support the audio tag.
                                </audio>
                              </div>
                            )}
                            {itemFileType === 'DOCUMENT' && item.signedUrl && (
                              <div className="aspect-video relative">
                                <iframe
                                  src={item.signedUrl}
                                  className="w-full h-full pointer-events-auto"
                                  title={`${purchasedContent.title} - Document ${index + 1}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                            <div className="p-2 text-xs text-gray-400 bg-gray-900">
                              Item {index + 1} of {purchasedContent.contentItems?.length ?? 0}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    {effectiveContentType === 'VIDEO' && (
                  <div className="aspect-video">
                    {purchasedContent.contentItems && purchasedContent.contentItems.length > 0 && purchasedContent.contentItems[0].signedUrl ? (
                      <VideoPlayer
                        src={purchasedContent.contentItems[0].signedUrl}
                        poster={purchasedContent.thumbnailUrl}
                        title={purchasedContent.title}
                        protectContent={true}
                        className="w-full h-full"
                        onError={(err) => console.error('[VIDEO] Error:', err)}
                        onPlay={() => console.log('[VIDEO] Started playing')}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/50">
                        <div className="text-center p-8">
                          <svg className="w-20 h-20 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-lg font-semibold mb-2">No Content URL Available</p>
                          <p className="text-sm text-gray-300">
                            contentItems: {JSON.stringify(purchasedContent.contentItems || 'null')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {effectiveContentType === 'IMAGE' && (
                  <div className="aspect-video relative">
                    {purchasedContent.contentItems && purchasedContent.contentItems.length > 0 && purchasedContent.contentItems[0].signedUrl ? (
                      <Image
                        src={purchasedContent.contentItems[0].signedUrl}
                        alt={purchasedContent.title}
                        fill
                        className="object-contain select-none"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <svg className="w-20 h-20 mx-auto mb-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <p className="text-lg">Loading image...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {effectiveContentType === 'DOCUMENT' && (
                  <div className="aspect-video relative">
                    {purchasedContent.contentItems && purchasedContent.contentItems.length > 0 && purchasedContent.contentItems[0].signedUrl ? (
                      <iframe
                        src={purchasedContent.contentItems[0].signedUrl}
                        className="w-full h-full"
                        title={purchasedContent.title}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <svg className="w-20 h-20 mx-auto mb-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-lg">Loading document...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {effectiveContentType === 'AUDIO' && (
                  <div className="aspect-video relative bg-linear-to-br from-purple-900 to-indigo-900">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      <div className="mb-8">
                        <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                      {purchasedContent.contentItems && purchasedContent.contentItems.length > 0 && purchasedContent.contentItems[0].signedUrl && (
                        <audio
                          controls
                          controlsList="nodownload"
                          className="w-full max-w-md"
                          preload="metadata"
                        >
                          <source
                            src={purchasedContent.contentItems[0].signedUrl}
                            type="audio/mpeg"
                          />
                          Your browser does not support the audio tag.
                        </audio>
                      )}
                    </div>
                  </div>
                )}

                {!['VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO'].includes(effectiveContentType) && (
                  <div className="aspect-video">
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
                          <p className="text-xs text-gray-300">
                            Declared: {purchasedContent.contentType} | Detected: {effectiveContentType}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                  </>
                )}
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
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Lightbox Modal for Gallery Items */}
        {lightboxOpen && purchasedContent.contentItems && purchasedContent.contentItems.length > 0 && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {purchasedContent.contentItems.length > 1 && lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {purchasedContent.contentItems.length > 1 && lightboxIndex < purchasedContent.contentItems.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Content Display */}
            <div className="max-w-7xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const currentItem = purchasedContent.contentItems[lightboxIndex];
                const itemFileType = getActualFileType(currentItem.s3Key);

                return (
                  <div className="relative">
                    {/* Watermark Overlay to prevent screenshots */}
                    <div className="absolute inset-0 pointer-events-none z-10 select-none">
                      <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-black/30 to-transparent flex items-center justify-center">
                        <p className="text-white/40 text-sm font-medium">Protected Content</p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/30 to-transparent flex items-center justify-center">
                        <p className="text-white/40 text-xs">© VeloLink - Unauthorized distribution prohibited</p>
                      </div>
                    </div>

                    {itemFileType === 'VIDEO' && currentItem.signedUrl && (
                      <VideoPlayer
                        src={currentItem.signedUrl}
                        autoPlay
                        protectContent={true}
                        className="max-w-full max-h-[90vh] mx-auto rounded-lg"
                      />
                    )}

                    {itemFileType === 'IMAGE' && currentItem.signedUrl && (
                      <div className="relative max-h-[90vh] mx-auto flex items-center justify-center">
                        <Image
                          src={currentItem.signedUrl}
                          alt={`${purchasedContent.title} - Item ${lightboxIndex + 1}`}
                          width={1920}
                          height={1080}
                          className="max-w-full max-h-[90vh] object-contain select-none pointer-events-none"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          priority
                        />
                      </div>
                    )}

                    {itemFileType === 'AUDIO' && currentItem.signedUrl && (
                      <div className="bg-linear-to-br from-purple-900 to-indigo-900 rounded-xl p-8 max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                          <svg className="w-24 h-24 text-white mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                          <h3 className="text-white text-xl font-semibold">{purchasedContent.title}</h3>
                        </div>
                        <audio
                          controls
                          autoPlay
                          className="w-full"
                          controlsList="nodownload"
                        >
                          <source src={currentItem.signedUrl} type="audio/mpeg" />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    )}

                    {itemFileType === 'DOCUMENT' && currentItem.signedUrl && (
                      <div className="bg-white rounded-xl overflow-hidden max-w-5xl mx-auto" style={{ height: '90vh' }}>
                        <iframe
                          src={currentItem.signedUrl}
                          className="w-full h-full"
                          title={`${purchasedContent.title} - Document ${lightboxIndex + 1}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Item Counter */}
              {purchasedContent.contentItems.length > 1 && (
                <div className="text-center mt-4">
                  <p className="text-white text-sm">
                    {lightboxIndex + 1} / {purchasedContent.contentItems.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  // Render preview/purchase view
  if (!isPurchased && content) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col relative overflow-hidden">
        {/* Floating Decorative Elements */}
        <motion.div
          className="absolute top-20 right-10 w-40 h-40 bg-linear-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 40, -30, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-32 h-32 bg-linear-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-2xl"
          animate={{
            x: [0, 50, -35, 0],
            y: [0, -45, 25, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-linear-to-br from-indigo-400/6 to-purple-400/6 rounded-full blur-xl"
          animate={{
            x: [0, -25, 20, 0],
            y: [0, 30, -15, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
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
                </div>
              </div>

              {/* Right Column - Details & Purchase */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 sm:p-8">
                  <h1 className="hidden lg:block text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{content.title}</h1>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ${(content.price * 1.10).toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm">one-time</span>
                    </div>
                  </div>

                  {content.description && (
                    <p className="hidden sm:block text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{content.description}</p>
                  )}

                  {/* Purchase Button */}
                  <motion.button
                    onClick={handlePurchase}
                    className="w-full px-6 py-4 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-purple-500/40 flex items-center justify-center gap-2 relative overflow-hidden group"
                    variants={buttonTap}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <motion.svg 
                      className="w-5 h-5 relative z-10" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </motion.svg>
                    <span className="relative z-10">
                      Unlock Content Now ✨
                    </span>
                  </motion.button>

                  {/* Payment Info */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Secure payment • Instant access</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <Image src="https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=white" alt="Stripe" width={80} height={20} className="h-5" />
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
