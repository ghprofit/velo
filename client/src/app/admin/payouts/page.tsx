'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import LogoutModal from '@/components/LogoutModal';
import {
  useGetPaymentStatsQuery,
  useGetPayoutsQuery,
  useProcessPayoutMutation,
} from '@/state/api';

export default function PayoutsPage() {
  const router = useRouter();
  const [activeTab,] = useState('payouts');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  // Fetch payment stats
  const { data: statsData, isLoading: statsLoading } = useGetPaymentStatsQuery();

  // Fetch payouts with filters
  const { data: payoutsData, isLoading: payoutsLoading } = useGetPayoutsQuery({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    page,
    limit,
  });

  // Process payout mutation
  const [processPayout, { isLoading: isProcessing }] = useProcessPayoutMutation();

  const stats = statsData || {
    totalRevenue: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    failedTransactions: 0,
  };

  const payouts = payoutsData?.data || [];
  const pagination = payoutsData?.pagination;

  // CSV Export function
  const exportToCSV = () => {
    if (!payouts.length) return;

    const headers = ['Payout ID', 'Creator Name', 'Creator Email', 'Amount', 'Currency', 'Payment Method', 'Status', 'Date'];
    const csvData = payouts.map(p => [
      p.id,
      p.creatorName,
      p.creatorEmail,
      p.amount,
      p.currency,
      p.paymentMethod || 'N/A',
      p.status,
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleProcessPayout = async (payoutId: string) => {
    if (!confirm('Are you sure you want to process this payout? This action will initiate the payment transfer.')) {
      return;
    }

    setProcessingPayoutId(payoutId);
    try {
      const result = await processPayout({ payoutId }).unwrap();
      if (result.success) {
        alert('Payout is being processed successfully!');
      } else {
        alert(result.message || 'Failed to process payout');
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      alert(error?.data?.message || 'An error occurred while processing the payout');
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} onLogout={() => setShowLogoutModal(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ml-12 lg:ml-0">Payouts Management</h1>
            <div className="hidden lg:flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search creator..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                  showFilters ? 'bg-indigo-50 border-indigo-600' : ''
                }`}
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>

              {/* Export CSV Button */}
              <button
                onClick={exportToCSV}
                disabled={!payouts.length}
                className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>

              {/* Profile Icon */}
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Payouts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Total Payouts</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-green-600 mb-2">
                  ${stats.totalPayouts.toFixed(2)}
                </p>
              )}
              <div className="h-1 bg-green-500 rounded-full"></div>
            </div>

            {/* Pending Payouts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Pending Payouts</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-yellow-600 mb-2">
                  ${stats.pendingPayouts.toFixed(2)}
                </p>
              )}
              <div className="h-1 bg-yellow-500 rounded-full"></div>
            </div>

            {/* Platform Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Platform Revenue</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              ) : (
                <p className="text-3xl font-bold text-indigo-600 mb-2">
                  ${(stats.totalRevenue - stats.totalPayouts).toFixed(2)}
                </p>
              )}
              <div className="h-1 bg-indigo-500 rounded-full"></div>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payout Requests</h2>
              {statusFilter === 'PENDING' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  {pagination?.total || 0} pending approval
                </span>
              )}
            </div>

            {payoutsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">No payouts found</p>
                {(searchQuery || statusFilter) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('');
                      setPage(1);
                    }}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payout ID</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Creator Name</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Email</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            #{payout.id.slice(0, 8)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">{payout.creatorName}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{payout.creatorEmail}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            ${payout.amount.toFixed(2)} {payout.currency}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {payout.paymentMethod || 'Not specified'}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            {payout.status === 'PENDING' ? (
                              <button
                                onClick={() => handleProcessPayout(payout.id)}
                                disabled={isProcessing && processingPayoutId === payout.id}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isProcessing && processingPayoutId === payout.id ? 'Processing...' : 'Process'}
                              </button>
                            ) : (
                              <span className="text-sm text-gray-500">
                                {payout.processedAt
                                  ? `Processed ${new Date(payout.processedAt).toLocaleDateString()}`
                                  : '-'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)} of {pagination.total} payouts
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              page === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          router.push('/login');
        }}
      />
    </div>
  );
}
