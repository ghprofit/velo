'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useGetSuperAdminContentByIdQuery,
  useSuperAdminReviewContentMutation,
  useSuperAdminRemoveContentMutation,
} from '@/state/api';
import Image from 'next/image';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

interface RecentPurchaseItem {
  id: string;
  buyerEmail?: string;
  amount: number;
  createdAt: string;
}

export default function SuperAdminContentDetailsPage() {
  const params = useParams();
  const contentId = params.id as string;

  const [reviewContent] = useSuperAdminReviewContentMutation();
  const [removeContent] = useSuperAdminRemoveContentMutation();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Fetch content details
  const { data: contentResponse, isLoading, error, refetch } = useGetSuperAdminContentByIdQuery(contentId);
  const content = contentResponse?.data;

  const handleApprove = async () => {
    if (!content) return;

    setIsReviewing(true);
    try {
      await reviewContent({ id: contentId, data: { decision: 'APPROVED' } }).unwrap();
      alert('Content approved successfully!');
      refetch();
    } catch (error) {
      const err = error as Error;
      alert(`Failed to approve content: ${err.message || 'Unknown error'}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!content) return;

    setIsReviewing(true);
    try {
      await reviewContent({ id: contentId, data: { decision: 'REJECTED' } }).unwrap();
      setShowRejectModal(false);
      alert('Content rejected successfully!');
      refetch();
    } catch (error) {
      const err = error as Error;
      alert(`Failed to reject content: ${err.message || 'Unknown error'}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRemove = async () => {
    if (!content) return;

    setIsReviewing(true);
    try {
      await removeContent({ id: contentId, data: { reason: 'Removed by Super Admin' } }).unwrap();
      setShowRemoveModal(false);
      alert('Content removed successfully!');
      refetch();
    } catch (error) {
      const err = error as Error;
      alert(`Failed to remove content: ${err.message || 'Unknown error'}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'PENDING_REVIEW':
        return 'bg-amber-100 text-amber-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'FLAGGED':
        return 'bg-orange-100 text-orange-700';
      case 'REMOVED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading content details...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h2>
          <p className="text-gray-600 mb-6">The content you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/superadmin/content"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Back to Content
          </Link>
        </div>
      </div>
    );
  }

  const isPendingOrFlagged = content.status === 'PENDING_REVIEW' || content.status === 'FLAGGED';
  const isApproved = content.status === 'APPROVED';
  const isRemoved = content.status === 'REMOVED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row items-start justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Content Details</h1>
            <p className="text-sm text-gray-600">Super Admin / Content / {content.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/superadmin/content" className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Content
            </Link>
          </div>
        </div>
      </header>

      {/* Content Details Section */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Full Content Viewer */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Content Preview</h3>

              {/* Check if content items exist with signed URLs */}
              {content.contentItems && content.contentItems.length > 0 ? (
                content.contentItems.length > 1 ? (
                  /* Gallery Grid for multiple items */
                  <div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {content.contentItems.map((item: any, index: number) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItemIndex(index)}
                          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-indigo-500 transition-all cursor-pointer group"
                        >
                          {item.signedUrl && getActualFileType(item.s3Key) === 'VIDEO' ? (
                            <video
                              src={item.signedUrl}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                              playsInline
                            />
                          ) : item.signedUrl ? (
                            <Image
                              src={item.signedUrl}
                              alt={`${content.title} - Item ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                          {/* Item number badge */}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Click on any item to view larger</p>

                    {/* Lightbox Modal */}
                    {selectedItemIndex !== null && content.contentItems[selectedItemIndex] && (
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
                        onClick={() => setSelectedItemIndex(null)}
                      >
                        <button
                          onClick={() => setSelectedItemIndex(null)}
                          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        {/* Navigation arrows */}
                        {selectedItemIndex > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemIndex(selectedItemIndex - 1);
                            }}
                            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
                          >
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        
                        {selectedItemIndex < content.contentItems.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemIndex(selectedItemIndex + 1);
                            }}
                            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
                          >
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}

                        <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                          <div className="text-white text-center mb-3">
                            Item {selectedItemIndex + 1} of {content.contentItems.length}
                          </div>
                          {(() => {
                            const selectedItem = content.contentItems[selectedItemIndex];
                            const actualFileType = getActualFileType(selectedItem.s3Key);

                            if (actualFileType === 'VIDEO' && selectedItem.signedUrl) {
                              return (
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                                  <VideoPlayer
                                    src={selectedItem.signedUrl}
                                    poster={content.thumbnailUrl || selectedItem.signedUrl}
                                    title={`${content.title} - Item ${selectedItemIndex + 1}`}
                                    protectContent={false}
                                    className="w-full h-full"
                                  />
                                </div>
                              );
                            } else if (selectedItem.signedUrl) {
                              return (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                                  <Image
                                    src={selectedItem.signedUrl}
                                    alt={`${content.title} - Item ${selectedItemIndex + 1}`}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Single item view */
                  <div className="relative w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-200">
                  {(() => {
                    const firstItem = content.contentItems[0];
                    const actualFileType = getActualFileType(firstItem.s3Key);

                    // Render based on actual file type
                    if (actualFileType === 'VIDEO') {
                      return (
                        <div className="aspect-video">
                          <VideoPlayer
                            src={firstItem.signedUrl}
                            poster={content.thumbnailUrl || firstItem.signedUrl}
                            title={content.title}
                            protectContent={false}
                            className="w-full h-full"
                          />
                        </div>
                      );
                    } else if (actualFileType === 'IMAGE') {
                      return (
                        <div className="aspect-video relative">
                          <Image
                            src={firstItem.signedUrl}
                            alt={content.title}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      );
                    } else if (actualFileType === 'AUDIO') {
                      return (
                        <div className="aspect-video relative bg-linear-to-br from-purple-900 to-indigo-900">
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <div className="mb-8">
                              <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                              </svg>
                            </div>
                            <audio
                              controls
                              className="w-full max-w-md"
                              preload="metadata"
                            >
                              <source src={firstItem.signedUrl} type="audio/mpeg" />
                              Your browser does not support the audio tag.
                            </audio>
                          </div>
                        </div>
                      );
                    } else if (actualFileType === 'DOCUMENT') {
                      return (
                        <div className="aspect-video relative">
                          <iframe
                            src={firstItem.signedUrl}
                            className="w-full h-full"
                            title={content.title}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="aspect-video relative bg-gray-800">
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <div className="text-center">
                              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                              </svg>
                              <p className="text-sm text-gray-300">Unknown file type</p>
                              <p className="text-xs text-gray-400 mt-1">{firstItem.s3Key.split('.').pop()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                  {content.s3Key && (
                    <div className="bg-gray-800 px-4 py-2">
                      <p className="text-xs text-gray-400">S3 Key: {content.s3Key}</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              // Fallback to thumbnail if no content items available
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {content.thumbnailUrl ? (
                  <Image
                    src={content.thumbnailUrl}
                    alt={content.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <p className="text-white text-sm">Content URL not available</p>
                </div>
              </div>
            )}
            </div>

            {/* Right Column - Details */}
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{content.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(content.status)}`}>
                    {formatStatus(content.status)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {content.mediaType}
                  </span>
                </div>
                {content.description && (
                  <p className="text-gray-700 mb-6">{content.description}</p>
                )}
              </div>

              {/* Content Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Content ID</p>
                  <p className="font-semibold text-gray-900">{content.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(Number(content.price))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created At</p>
                  <p className="font-semibold text-gray-900">{formatDateTime(content.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Updated At</p>
                  <p className="font-semibold text-gray-900">{formatDateTime(content.updatedAt)}</p>
                </div>
              </div>

              {/* Action Buttons for Pending or Flagged Content */}
              {isPendingOrFlagged && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={isReviewing}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isReviewing}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => setShowRemoveModal(true)}
                      disabled={isReviewing}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons for Approved Content */}
              {isApproved && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderation Actions</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This content has been approved. As a Super Admin, you can reject it or permanently remove it if policy violations are found.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isReviewing}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject Content
                    </button>
                    <button
                      onClick={() => setShowRemoveModal(true)}
                      disabled={isReviewing}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Permanently Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Info for Removed Content */}
              {isRemoved && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      This content has been permanently removed and is no longer accessible to users.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Creator Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 lg:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Creator Name</p>
              <Link
                href={`/superadmin/creators/${content.creatorId}`}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {content.creatorName}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Creator ID</p>
              <p className="font-semibold text-gray-900">{content.creatorId.slice(0, 16).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Purchases</h2>
            <span className="text-sm text-gray-600">{content.recentPurchases?.length || 0} purchases</span>
          </div>

          {content.recentPurchases && content.recentPurchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Purchase ID</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {content.recentPurchases.map((purchase: RecentPurchaseItem) => (
                    <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{purchase.id.slice(0, 16).toUpperCase()}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{formatCurrency(Number(purchase.amount))}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{formatDateTime(purchase.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No purchases yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Rejection</h3>
            <p className="text-gray-600 mb-6">
              {content.status === 'APPROVED'
                ? 'Are you sure you want to reject this previously approved content? This will make it inaccessible to users. The creator will be notified via email.'
                : 'Are you sure you want to reject this content? The creator will be notified via email.'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isReviewing}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isReviewing}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReviewing ? 'Rejecting...' : 'Reject Content'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Permanently Remove Content</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently remove this content? This action cannot be undone. The content will be inaccessible to all users and the creator will be notified.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRemoveModal(false)}
                disabled={isReviewing}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={isReviewing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReviewing ? 'Removing...' : 'Permanently Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
