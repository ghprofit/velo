'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentApi } from '@/lib/api-client';
import Image from 'next/image';
import FloatingLogo from '@/components/FloatingLogo';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

interface ContentItem {
  id: string;
  s3Key: string;
  fileSize: number;
  order: number;
  signedUrl?: string;
}

interface Creator {
  id: string;
  displayName: string;
  user: {
    displayName: string;
    profilePicture: string | null;
  };
}

interface Content {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnailUrl: string;
  contentType: string;
  fileSize: number;
  duration: number | null;
  status: string;
  complianceStatus?: string;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  purchaseCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  contentItems: ContentItem[];
  creator: Creator;
}

// Check if content is approved and can be shared
const isContentApproved = (content: Content): boolean => {
  return content.status === 'APPROVED' &&
         content.complianceStatus !== 'MANUAL_REVIEW' &&
         content.complianceStatus !== 'FLAGGED';
};

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Lightbox state for gallery items
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await contentApi.getContentById(contentId);
        console.log('[CREATOR] Full API response:', response);
        
        const contentData = response.data?.data || response.data;
        console.log('[CREATOR] Content data:', contentData);
        console.log('[CREATOR] Content items:', contentData?.contentItems);
        
        setContent(contentData);
        
        // Extract signed URLs if present in the response
        if (contentData?.contentItems && Array.isArray(contentData.contentItems)) {
          const urls: { [key: string]: string } = {};
          contentData.contentItems.forEach((item: ContentItem) => {
            console.log(`[CREATOR] Item ${item.id} - has signedUrl:`, !!item.signedUrl);
            if (item.signedUrl) {
              urls[item.id] = item.signedUrl;
              console.log(`[CREATOR] Stored URL for ${item.id}:`, item.signedUrl.substring(0, 100) + '...');
            }
          });
          console.log('[CREATOR] Total preview URLs stored:', Object.keys(urls).length);
          if (Object.keys(urls).length > 0) {
            setPreviewUrls(urls);
          } else if (contentData.contentType === 'VIDEO' || contentData.contentType === 'IMAGE') {
            // If VIDEO or IMAGE content but no signed URLs, fetch them automatically
            console.log(`[CREATOR] ${contentData.contentType} content detected without signed URLs, fetching now...`);
            // Delay to ensure state is set
            setTimeout(() => {
              fetchPreviewUrls();
            }, 100);
          }
        }
        
        setError(null);
      } catch (err: unknown) {
        console.error('Failed to fetch content:', err);
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Content not found');
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await contentApi.deleteContent(contentId);
      router.push('/creator/analytics');
    } catch (err: unknown) {
      console.error('Failed to delete content:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete content');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const copyLink = () => {
    const link = `https://velolink.club/c/${contentId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper function to detect file type from S3 key
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

  // Fetch signed URLs for content preview
  const fetchPreviewUrls = async () => {
    if (!content || !content.contentItems) return;
    
    setLoadingPreview(true);
    try {
      console.log('[CREATOR PREVIEW] Fetching signed URLs for content:', contentId);
      
      const response = await contentApi.getContentById(contentId);
      console.log('[CREATOR PREVIEW] API Response:', response);
      
      // Handle response structure - API might return data directly or nested in .data
      const contentData = response.data?.data || response.data;
      console.log('[CREATOR PREVIEW] Content data:', contentData);
      
      // If the API returns signed URLs in contentItems, use them
      if (contentData?.contentItems && Array.isArray(contentData.contentItems)) {
        const urls: { [key: string]: string } = {};
        let urlCount = 0;
        
        contentData.contentItems.forEach((item: ContentItem) => {
          if (item.signedUrl) {
            urls[item.id] = item.signedUrl;
            urlCount++;
            console.log(`[CREATOR PREVIEW] Got signed URL for item ${item.id}:`, item.signedUrl.substring(0, 100) + '...');
          } else {
            console.warn(`[CREATOR PREVIEW] No signed URL for item ${item.id}`);
          }
        });
        
        console.log(`[CREATOR PREVIEW] Total signed URLs fetched: ${urlCount}`);
        setPreviewUrls(urls);
      } else {
        console.error('[CREATOR PREVIEW] No content items in response or invalid structure');
      }
    } catch (err) {
      console.error('[CREATOR PREVIEW] Failed to fetch preview URLs:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Open lightbox and fetch preview URLs if needed
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    
    // Fetch preview URLs if not already loaded
    if (Object.keys(previewUrls).length === 0) {
      fetchPreviewUrls();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'FLAGGED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'IMAGE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'GALLERY':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Content Not Found</h2>
          <p className="text-red-600 mb-4">{error || 'The content you are looking for does not exist.'}</p>
          <Link
            href="/creator/analytics"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Analytics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/creator/analytics"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{content.title}</h1>
              <p className="text-sm sm:text-base text-gray-600">Content Details & Performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isContentApproved(content) ? (
              <button
                onClick={copyLink}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm sm:text-base rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span className="hidden sm:inline">Copy Link</span>
                  </>
                )}
              </button>
            ) : (
              <span className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-amber-100 text-amber-800 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Under Review</span>
              </span>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 relative">
        {/* Floating Brand Logo */}
        <FloatingLogo
          position="bottom-right"
          size={90}
          animation="float"
          opacity={0.07}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Content Preview & Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Video Preview (for VIDEO type content) */}
            {content.contentType === 'VIDEO' && content.contentItems && content.contentItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-black relative">
                  {previewUrls[content.contentItems[0].id] ? (
                    <>
                      <VideoPlayer
                        src={previewUrls[content.contentItems[0].id]}
                        poster={content.thumbnailUrl}
                        title={content.title}
                        protectContent={false}
                        className="w-full h-full"
                        onError={(err) => console.error('[CREATOR VIDEO] Error:', err)}
                        onPlay={() => console.log('[CREATOR VIDEO] Started playing')}
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                          {content.status.replace('_', ' ')}
                        </span>
                        {content.isPublished && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-sm mb-3">Loading video preview...</p>
                        <button
                          onClick={fetchPreviewUrls}
                          disabled={loadingPreview}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingPreview ? 'Loading...' : 'Load Preview'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Preview (for IMAGE types - show actual content) */}
            {content.contentType === 'IMAGE' && content.contentItems && content.contentItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {previewUrls[content.contentItems[0].id] ? (
                    <>
                      <Image
                        src={previewUrls[content.contentItems[0].id]}
                        alt={content.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23eee" width="800" height="450"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20"%3EFailed to load%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                          {content.status.replace('_', ' ')}
                        </span>
                        {content.isPublished && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 text-sm mb-3">Loading image preview...</p>
                        <button
                          onClick={fetchPreviewUrls}
                          disabled={loadingPreview}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingPreview ? 'Loading...' : 'Load Preview'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other content types (DOCUMENT, AUDIO, etc.) - show thumbnail */}
            {content.contentType !== 'VIDEO' && content.contentType !== 'IMAGE' && content.contentType !== 'GALLERY' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  <Image
                    src={content.thumbnailUrl}
                    alt={content.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23eee" width="800" height="450"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20"%3ENo Thumbnail%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                      {content.status.replace('_', ' ')}
                    </span>
                    {content.isPublished && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                    {getContentTypeIcon(content.contentType)}
                    <span>{content.contentType}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content Items (for GALLERY) */}
            {content.contentType === 'GALLERY' && content.contentItems && content.contentItems.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Gallery Items ({content.contentItems.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {content.contentItems.map((item, index) => {
                    const itemFileType = getActualFileType(item.s3Key);
                    const fileName = item.s3Key.split('/').pop();
                    return (
                      <div 
                        key={item.id} 
                        className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group relative hover:ring-2 hover:ring-indigo-500 transition-all"
                        onClick={() => openLightbox(index)}
                      >
                        <div className="aspect-video bg-gray-700 flex items-center justify-center relative">
                          {/* Show actual image/video if preview URL available */}
                          {previewUrls[item.id] && itemFileType === 'IMAGE' && (
                            <>
                              <Image
                                src={previewUrls[item.id]}
                                alt={fileName || 'Gallery item'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </>
                          )}
                          
                          {previewUrls[item.id] && itemFileType === 'VIDEO' && (
                            <>
                              <video
                                className="w-full h-full object-cover"
                                preload="metadata"
                              >
                                <source src={previewUrls[item.id]} type="video/mp4" />
                              </video>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </>
                          )}
                          
                          {/* Show icons as fallback if no preview URL */}
                          {!previewUrls[item.id] && itemFileType === 'VIDEO' && (
                            <>
                              <svg className="w-12 h-12 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                            </>
                          )}
                          {!previewUrls[item.id] && itemFileType === 'IMAGE' && (
                            <>
                              <svg className="w-12 h-12 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </>
                          )}
                          {itemFileType === 'AUDIO' && (
                            <>
                              <svg className="w-12 h-12 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                              </svg>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </>
                          )}
                          {itemFileType === 'DOCUMENT' && (
                            <>
                              <svg className="w-12 h-12 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="p-2 bg-gray-900">
                          <div className="text-xs text-gray-400 mb-1">Item {index + 1}</div>
                          <div className="text-xs font-medium text-white truncate" title={fileName}>
                            {fileName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatFileSize(item.fileSize)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Content Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Title</label>
                  <p className="text-gray-900 font-medium">{content.title}</p>
                </div>

                {content.description && (
                  <div>
                    <label className="text-sm text-gray-500">Description</label>
                    <p className="text-gray-900">{content.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm text-gray-500">Price</label>
                    <p className="text-gray-900 font-semibold">${content.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">File Size</label>
                    <p className="text-gray-900">{formatFileSize(content.fileSize)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Duration</label>
                    <p className="text-gray-900">{formatDuration(content.duration)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Items</label>
                    <p className="text-gray-900">{content.contentItems?.length || 1}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm text-gray-500">Created</label>
                    <p className="text-gray-900">
                      {new Date(content.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {content.publishedAt && (
                    <div>
                      <label className="text-sm text-gray-500">Published</label>
                      <p className="text-gray-900">
                        {new Date(content.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Share Link - Only show when approved */}
            {isContentApproved(content) ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Share Link</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 overflow-x-auto">
                    <code className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">https://velolink.club/c/{content.id}</code>
                  </div>
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 sm:py-3 bg-gray-900 text-white text-sm sm:text-base rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-amber-900 mb-1">Content Under Review</h3>
                    <p className="text-sm text-amber-800">
                      Your shareable link will be available once your content is approved.
                      You&apos;ll receive an email notification when the review is complete.
                    </p>
                    {content.status === 'PENDING_REVIEW' && (
                      <p className="text-xs text-amber-700 mt-2">
                        Typical review time: 1-2 minutes for images, up to 5 minutes for videos.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Performance Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Performance Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Performance</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 icon-3d-container icon-3d-blue rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Total Views</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{content.viewCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 icon-3d-container icon-3d-purple rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Unlocks</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{content.purchaseCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 icon-3d-container icon-3d-green rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Revenue</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">${content.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Conversion</h2>

              <div className="text-center py-3 sm:py-4">
                <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">
                  {content.viewCount > 0
                    ? ((content.purchaseCount / content.viewCount) * 100).toFixed(1)
                    : '0.0'}%
                </div>
                <p className="text-gray-500 text-sm">View to Purchase Rate</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Avg. Revenue per View</span>
                  <span className="font-medium text-gray-900">
                    ${content.viewCount > 0 ? (content.totalRevenue / content.viewCount).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Avg. Revenue per Unlock</span>
                  <span className="font-medium text-gray-900">
                    ${content.purchaseCount > 0 ? (content.totalRevenue / content.purchaseCount).toFixed(2) : content.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>

              <div className="space-y-2 sm:space-y-3">
                {isContentApproved(content) ? (
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-gray-700 text-sm sm:text-base rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Content
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 text-amber-700 text-sm sm:text-base rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Awaiting Approval
                  </div>
                )}
                <Link
                  href="/creator/analytics"
                  className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-gray-700 text-sm sm:text-base rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View All Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Gallery Items */}
      {lightboxOpen && content && content.contentItems && content.contentItems.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {lightboxIndex < content.contentItems.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Item Counter */}
          <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
            {lightboxIndex + 1} / {content.contentItems.length}
          </div>

          {/* Content Display */}
          <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const currentItem = content.contentItems[lightboxIndex];
              const itemFileType = getActualFileType(currentItem.s3Key);
              const fileName = currentItem.s3Key.split('/').pop();
              const hasPreviewUrl = !!previewUrls[currentItem.id];
              
              console.log('[CREATOR LIGHTBOX] Current item:', currentItem.id);
              console.log('[CREATOR LIGHTBOX] File type:', itemFileType);
              console.log('[CREATOR LIGHTBOX] Has preview URL:', hasPreviewUrl);
              console.log('[CREATOR LIGHTBOX] Preview URLs state:', previewUrls);
              console.log('[CREATOR LIGHTBOX] Loading preview:', loadingPreview);

              return (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  {loadingPreview && (
                    <div className="aspect-video bg-black flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm">Loading preview...</p>
                      </div>
                    </div>
                  )}

                  {!loadingPreview && itemFileType === 'VIDEO' && (
                    <div className="aspect-video bg-black">
                      {previewUrls[currentItem.id] ? (
                        <VideoPlayer
                          src={previewUrls[currentItem.id]}
                          title={fileName || 'Video'}
                          protectContent={false}
                          autoPlay={true}
                          className="w-full h-full"
                          onError={(err) => console.error('[CREATOR LIGHTBOX VIDEO] Error:', err)}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-white p-8">
                            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            <p className="text-lg font-medium mb-2">Video File</p>
                            <p className="text-sm text-gray-400">{fileName}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatFileSize(currentItem.fileSize)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!loadingPreview && itemFileType === 'IMAGE' && (
                    <div className="aspect-video bg-black relative">
                      {previewUrls[currentItem.id] ? (
                        <Image
                          src={previewUrls[currentItem.id]}
                          alt={fileName || 'Image'}
                          fill
                          className="object-contain"
                          sizes="(max-width: 1536px) 100vw, 1536px"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white p-8">
                            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <p className="text-lg font-medium mb-2">Image File</p>
                            <p className="text-sm text-gray-400">{fileName}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatFileSize(currentItem.fileSize)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!loadingPreview && itemFileType === 'AUDIO' && (
                    <div className="bg-linear-to-br from-purple-900 to-indigo-900 p-12">
                      <div className="text-center text-white">
                        <svg className="w-24 h-24 mx-auto mb-6 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                        <p className="text-xl font-medium mb-2">Audio File</p>
                        <p className="text-sm text-gray-300 mb-4">{fileName}</p>
                        {previewUrls[currentItem.id] && (
                          <audio
                            controls
                            autoPlay
                            className="w-full max-w-md mx-auto"
                            preload="metadata"
                          >
                            <source src={previewUrls[currentItem.id]} type="audio/mpeg" />
                            Your browser does not support the audio tag.
                          </audio>
                        )}
                        <p className="text-xs text-gray-400 mt-4">{formatFileSize(currentItem.fileSize)}</p>
                      </div>
                    </div>
                  )}

                  {!loadingPreview && itemFileType === 'DOCUMENT' && (
                    <div className="aspect-video bg-black">
                      {previewUrls[currentItem.id] ? (
                        <iframe
                          src={previewUrls[currentItem.id]}
                          className="w-full h-full"
                          title={fileName || 'Document'}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-white p-8">
                            <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-lg font-medium mb-2">Document File</p>
                            <p className="text-sm text-gray-400">{fileName}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatFileSize(currentItem.fileSize)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!loadingPreview && itemFileType === 'UNKNOWN' && (
                    <div className="aspect-video bg-black flex items-center justify-center">
                      <div className="text-center text-white p-8">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v4a1 1 0 102 0V9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-lg font-medium mb-2">File Preview</p>
                        <p className="text-sm text-gray-400">{fileName}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatFileSize(currentItem.fileSize)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Delete Content?</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Are you sure you want to delete &quot;{content.title}&quot;? This action cannot be undone and all associated data will be permanently removed.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm sm:text-base rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full sm:flex-1 px-4 py-2 bg-red-600 text-white text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Content'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
