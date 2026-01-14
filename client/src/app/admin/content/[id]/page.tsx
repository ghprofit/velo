'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useGetAdminContentByIdQuery,
  useReviewContentMutation,
  useFlagContentMutation,
} from '@/state/api';
import AdminSidebar from '@/components/AdminSidebar';
import Image from 'next/image';

interface RecentPurchaseItem {
  id: string;
  buyerEmail?: string;
  amount: number;
  createdAt: string;
}

export default function ContentDetailsPage() {
  const params = useParams();
  const contentId = params.id as string;

  const [reviewContent] = useReviewContentMutation();
  const [flagContent] = useFlagContentMutation();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const activeTab = 'content';

  // Fetch content details
  const { data: contentResponse, isLoading, error, refetch } = useGetAdminContentByIdQuery(contentId);
  const content = contentResponse?.data;

  const handleApprove = async () => {
    if (!content) return;

    setIsReviewing(true);
    try {
      await reviewContent({ id: contentId, data: { status: 'APPROVED' } }).unwrap();
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
      await reviewContent({ id: contentId, data: { status: 'REJECTED' } }).unwrap();
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

  const handleFlag = async () => {
    if (!content) return;

    setIsReviewing(true);
    try {
      await flagContent({
        id: contentId,
        reason: 'Content flagged for re-review by admin',
      }).unwrap();
      alert('Content flagged for review successfully!');
      refetch();
    } catch (error) {
      const err = error as Error;
      alert(`Failed to flag content: ${err.message || 'Unknown error'}`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar activeTab={activeTab} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">Loading content details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar activeTab={activeTab} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h2>
            <p className="text-gray-600 mb-6">The content you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/admin/content"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
            >
              Back to Content
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isPendingOrFlagged = content.status === 'PENDING_REVIEW' || content.status === 'FLAGGED';
  const isApproved = content.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-4 gap-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Content Details</h1>
              <p className="text-sm text-gray-600">Home / Content / {content.title}</p>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/admin/content" className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
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
              {/* Left Column - Thumbnail */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preview</h3>
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
                </div>
                {content.s3Key && (
                  <p className="mt-2 text-xs text-gray-500">S3 Key: {content.s3Key}</p>
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
                    </div>
                  </div>
                )}

                {/* Action Buttons for Approved Content */}
                {isApproved && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderation Actions</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This content has been approved. You can flag it for re-review or reject it if policy violations are found.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleFlag}
                        disabled={isReviewing}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        Flag for Review
                      </button>
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Creator Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 lg:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Creator Name</p>
                <Link
                  href={`/admin/creators/${content.creator.id}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {content.creator.name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{content.creator.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Creator ID</p>
                <p className="font-semibold text-gray-900">{content.creator.id.slice(0, 16).toUpperCase()}</p>
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
      </main>

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
    </div>
  );
}
