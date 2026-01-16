'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useGetAdminTransactionsQuery, useGetPaymentStatsQuery } from '@/state/api';

export default function PaymentsPage() {
  const [activeTab] = useState('payments');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('Monthly');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Fetch transactions with pagination and filters
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useGetAdminTransactionsQuery({
    search: searchQuery || undefined,
    status: statusFilter,
    page: currentPage,
    limit: 10,
  });

  // Fetch payment stats
  const { data: statsData, isLoading: statsLoading } = useGetPaymentStatsQuery();

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ml-12 lg:ml-0">Payments Dashboard</h1>
            <div className="hidden lg:flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transaction or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Button */}
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>

              {/* Export CSV Button */}
              <button className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>

              {/* Date Range */}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date Range
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Settings Icon */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Profile Icon */}
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Total Revenue</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {statsLoading ? 'Loading...' : formatCurrency(statsData?.totalRevenue || 0)}
              </p>
              <div className="h-1 bg-linear-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            </div>

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
              <p className="text-3xl font-bold text-green-600 mb-2">
                {statsLoading ? 'Loading...' : formatCurrency(statsData?.totalPayouts || 0)}
              </p>
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
              <p className="text-3xl font-bold text-yellow-600 mb-2">
                {statsLoading ? 'Loading...' : formatCurrency(statsData?.pendingPayouts || 0)}
              </p>
              <div className="h-1 bg-yellow-500 rounded-full"></div>
            </div>

            {/* Failed Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Failed Transactions</span>
              </div>
              <p className="text-3xl font-bold text-red-600 mb-2">
                {statsLoading ? 'Loading...' : (statsData?.failedTransactions || 0)}
              </p>
              <div className="h-1 bg-red-500 rounded-full"></div>
            </div>
          </div>

          {/* Earnings Over Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Earnings Over Time</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimeRange('Weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'Weekly'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeRange('Monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'Monthly'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeRange('Yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'Yearly'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-end gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-gray-600">Revenue (line)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span className="text-gray-600">Bars (volume)</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 border border-gray-200 rounded-lg bg-gray-50 relative">
              {/* Simple line visualization */}
              <svg className="w-full h-full" viewBox="0 0 800 250">
                {/* Grid lines */}
                <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                {/* Bars */}
                <rect x="50" y="140" width="40" height="60" fill="#e5e7eb" rx="2" />
                <rect x="150" y="120" width="40" height="80" fill="#e5e7eb" rx="2" />
                <rect x="250" y="100" width="40" height="100" fill="#e5e7eb" rx="2" />
                <rect x="350" y="110" width="40" height="90" fill="#e5e7eb" rx="2" />
                <rect x="450" y="80" width="40" height="120" fill="#e5e7eb" rx="2" />
                <rect x="550" y="90" width="40" height="110" fill="#e5e7eb" rx="2" />
                <rect x="650" y="70" width="40" height="130" fill="#e5e7eb" rx="2" />

                {/* Revenue line */}
                <polyline
                  points="70,150 170,130 270,110 370,115 470,90 570,95 670,75"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                <circle cx="70" cy="150" r="4" fill="#6366f1" />
                <circle cx="170" cy="130" r="4" fill="#6366f1" />
                <circle cx="270" cy="110" r="4" fill="#6366f1" />
                <circle cx="370" cy="115" r="4" fill="#6366f1" />
                <circle cx="470" cy="90" r="4" fill="#6366f1" />
                <circle cx="570" cy="95" r="4" fill="#6366f1" />
                <circle cx="670" cy="75" r="4" fill="#6366f1" />
              </svg>

              {/* Axis labels */}
              <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                X: Weeks • Y: USD
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Transactions</h2>

            {transactionsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">Loading transactions...</div>
              </div>
            ) : transactionsError ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-red-600">Error loading transactions. Please try again.</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">No transactions found.</div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Creator Name</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Buyer Email</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">#{transaction.id.slice(0, 8)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{transaction.creatorName}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{transaction.buyerEmail}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatCurrency(transaction.amount, transaction.currency)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{transaction.paymentMethod}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatDate(transaction.createdAt)}</td>
                          <td className="py-4 px-4">
                            <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {pagination.totalPages > 5 && <span className="text-gray-500">...</span>}
                      <button
                        onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                        disabled={currentPage === pagination.totalPages}
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
    </div>
  );
}
