'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Settings, LogOut } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { adminApi } from '@/lib/api-client';
import { useLogout } from '@/hooks/useLogout';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface PayoutRequest {
  id: string;
  creatorId: string;
  requestedAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  creator: {
    displayName: string;
    user: {
      email: string;
    };
  };
}

export default function AdminPayoutsPage() {
  const { hasAccess, loading: accessLoading } = useAdminAccess({ allowedRoles: ['FINANCIAL_ADMIN'] });
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout } = useLogout();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getPayoutRequests({
        status: filter === 'ALL' ? undefined : filter
      });
      setRequests(response.data.data);
    } catch (error: unknown) {
      console.error('Failed to fetch payout requests:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || 'Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (accessLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const handleApprove = (request: PayoutRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      await adminApi.approvePayoutRequest({
        requestId: selectedRequest.id,
        reviewNotes: 'Approved for processing',
      });

      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchRequests();
      alert('Payout request approved successfully!');
    } catch (error: unknown) {
      console.error('Failed to approve payout request:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(errorMessage || 'Failed to approve payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = (request: PayoutRequest) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.rejectPayoutRequest({
        requestId: selectedRequest.id,
        reviewNotes: rejectReason,
      });

      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchRequests();
      alert('Payout request rejected');
    } catch (error: unknown) {
      console.error('Failed to reject payout request:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(errorMessage || 'Failed to reject payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab="payouts" />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payout Requests</h1>
              <p className="text-gray-600 mt-2">Review and manage creator payout requests</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Button */}
              <button
                onClick={() => router.push('/admin/notifications')}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">A</span>
                  </div>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex gap-4 flex-wrap">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payout requests...</p>
            </div>
          )}

          {/* Requests Table */}
          {!loading && requests.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No payout requests found for the selected filter.</p>
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{request.creator.displayName}</div>
                            <div className="text-sm text-gray-500">{request.creator.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 font-semibold">
                            ${request.requestedAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">{request.currency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(request)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {request.status !== 'PENDING' && request.reviewNotes && (
                            <div className="text-xs text-gray-500">
                              <div className="font-medium">Notes:</div>
                              <div className="truncate max-w-xs">{request.reviewNotes}</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approve Modal */}
          {showApproveModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Approve Payout Request</h3>
                <p className="text-gray-600 mb-6">
                  Approve payout of <span className="font-semibold">${selectedRequest.requestedAmount.toFixed(2)}</span> for{' '}
                  <span className="font-semibold">{selectedRequest.creator.displayName}</span>?
                </p>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    This will create a payout for Stripe to process. The creator will be notified via email and in-app notification.
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowApproveModal(false);
                      setSelectedRequest(null);
                    }}
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApprove}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && selectedRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Reject Payout Request</h3>
                <p className="text-gray-600 mb-4">
                  Reject payout of <span className="font-semibold">${selectedRequest.requestedAmount.toFixed(2)}</span> for{' '}
                  <span className="font-semibold">{selectedRequest.creator.displayName}</span>?
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection (required) *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                    disabled={submitting}
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6">
                  <p className="text-sm text-yellow-800">
                    The creator will be notified of the rejection and the reason you provide.
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedRequest(null);
                      setRejectReason('');
                    }}
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    disabled={submitting || !rejectReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
