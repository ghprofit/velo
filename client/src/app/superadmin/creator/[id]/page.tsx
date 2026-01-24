'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetCreatorByIdQuery } from '@/state/api';

export default function CreatorAuditPage() {
  const params = useParams();
  const creatorId = params.id as string;

  const { data: creatorResponse, isLoading, error } = useGetCreatorByIdQuery(creatorId);
  const creator = creatorResponse?.data;

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 border-green-300';
      case 'On Hold':
        return 'text-yellow-600 border-yellow-300';
      case 'Suspended':
        return 'text-red-600 border-red-300';
      default:
        return 'text-gray-600 border-gray-300';
    }
  };

  const getKycStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Verified':
        return 'text-green-600 border-green-300';
      case 'Pending':
      case 'In Progress':
        return 'text-yellow-600 border-yellow-300';
      case 'Failed':
      case 'Rejected':
        return 'text-red-600 border-red-300';
      default:
        return 'text-gray-600 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading creator details...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creator Not Found</h2>
          <p className="text-gray-600 mb-6">The creator you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/superadmin/creators"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Back to Creators
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/superadmin/creators"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Audit: {creator.name}</h1>
              <p className="text-gray-500">Complete creator profile and action center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 bg-white rounded-full text-sm font-medium border ${getStatusColor(creator.payoutStatus)}`}>
              {creator.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`px-4 py-2 bg-white rounded-full text-sm font-medium border ${getKycStatusColor(creator.kycStatus)}`}>
              KYC {creator.kycStatus}
            </span>
            <button className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspend Account
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Ban Permanently
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-white text-red-600 rounded-lg font-semibold border border-red-300 hover:bg-red-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Override KYC
            </button>
          </div>
        </div>
      </div>

      {/* Profile, Contact & Verification */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Profile, Contact & Verification</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View KYC Documents
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: User Info */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {creator.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{creator.name}</h3>
              <p className="text-gray-500">{creator.email}</p>
              <p className="text-gray-500">DOB: {formatDate(creator.profile?.dateOfBirth)}</p>
            </div>
          </div>

          {/* Middle: Verification Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verification Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                creator.verification?.status === 'VERIFIED'
                  ? 'bg-green-100 text-green-700'
                  : creator.verification?.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
              }`}>
                {creator.verification?.status || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verified At</span>
              <span className="text-gray-900">{formatDate(creator.verification?.verifiedAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Country</span>
              <span className="text-gray-900">{creator.profile?.country || 'N/A'}</span>
            </div>
          </div>

          {/* Right: Account Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Account Created</span>
              <span className="text-gray-900">{formatDate(creator.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Activity</span>
              <span className="text-gray-900">{creator.lastLogin || 'Never'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Policy Strikes</span>
              <span className={`font-medium ${creator.policyStrikes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {creator.policyStrikes || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Financial Overview</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Full History
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Lifetime Earnings */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lifetime Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(creator.stats?.totalEarnings)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Total Views */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{(creator.stats?.totalViews || 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>

          {/* Total Purchases */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{(creator.stats?.totalPurchases || 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          {/* Payout Method */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payout Method</p>
              <div className="flex items-center gap-2">
                {creator.payout?.stripeAccountId && (
                  <>
                    <span className="text-sm font-medium text-indigo-600">Stripe</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Connected
                    </span>
                  </>
                )}
                {creator.payout?.paypalEmail && !creator.payout?.stripeAccountId && (
                  <>
                    <span className="text-sm font-medium text-blue-600">PayPal</span>
                    <span className="text-gray-900 text-sm">{creator.payout.paypalEmail}</span>
                  </>
                )}
                {!creator.payout?.stripeAccountId && !creator.payout?.paypalEmail && (
                  <span className="text-gray-500">Not configured</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Content Overview</h2>
          <Link
            href={`/superadmin/content?creatorId=${creator.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Review Content Library
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center py-6 border border-gray-200 rounded-lg">
            <p className="text-4xl font-bold text-gray-900 mb-2">{creator.stats?.contentCount || 0}</p>
            <p className="text-sm text-gray-600">Total Content Uploaded</p>
          </div>
          <div className="text-center py-6 border border-gray-200 rounded-lg">
            <p className="text-4xl font-bold text-blue-500 mb-2">{(creator.stats?.totalViews || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
          <div className="text-center py-6 border border-gray-200 rounded-lg">
            <p className="text-4xl font-bold text-orange-500 mb-2">{creator.policyStrikes || 0}</p>
            <p className="text-sm text-gray-600">Policy Strikes</p>
          </div>
        </div>

        {/* Recent Content */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Content</h3>
          {creator.recentContent && creator.recentContent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Title</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Created</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creator.recentContent.map((content: { id: string; title: string; status: string; createdAt: string }) => (
                    <tr key={content.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-gray-900">{content.title}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          content.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                          content.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-600' :
                          content.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {content.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600">{formatDate(content.createdAt)}</td>
                      <td className="py-4 px-4 text-center">
                        <Link
                          href={`/superadmin/content/${content.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No content uploaded yet</p>
          )}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Payouts</h2>
          <span className="text-sm text-gray-500">Payout Status: {creator.payout?.status || 'N/A'}</span>
        </div>

        {creator.recentPayouts && creator.recentPayouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Payout ID</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {creator.recentPayouts.map((payout: { id: string; amount: number; status: string; createdAt: string }) => (
                  <tr key={payout.id} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-900 font-mono text-sm">{payout.id.slice(0, 16).toUpperCase()}</td>
                    <td className="py-4 px-4 text-center text-gray-900 font-medium">{formatCurrency(payout.amount)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        payout.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                        payout.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                        payout.status === 'FAILED' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{formatDateTime(payout.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No payouts yet</p>
        )}
      </div>
    </div>
  );
}
