'use client';

import { useState, useMemo } from 'react';
import {
  useGetFinancialOverviewQuery,
  useGetRevenueReportQuery,
  useGetPayoutReportQuery,
  useGetPayoutStatsQuery,
  useGetCreatorEarningsQuery,
} from '@/state/api';

export default function FinancialReportsPage() {
  const [timeRange, setTimeRange] = useState<'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM'>('LAST_30_DAYS');
  const [reportType, setReportType] = useState<'REVENUE' | 'PAYOUTS' | 'CREATOR_EARNINGS'>('REVENUE');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch overview data
  const { data: overview, isLoading: overviewLoading } = useGetFinancialOverviewQuery({
    timeRange,
  });

  // Fetch payout stats
  const { data: payoutStats } = useGetPayoutStatsQuery();

  // Fetch report data based on type
  const { data: revenueReport, isLoading: revenueLoading } = useGetRevenueReportQuery(
    {
      timeRange,
      page,
      limit,
    },
    { skip: reportType !== 'REVENUE' }
  );

  const { data: payoutReport, isLoading: payoutLoading } = useGetPayoutReportQuery(
    {
      timeRange,
      page,
      limit,
      status: statusFilter || undefined,
    },
    { skip: reportType !== 'PAYOUTS' }
  );

  const { data: creatorEarnings, isLoading: earningsLoading } = useGetCreatorEarningsQuery(
    {
      page,
      limit,
    },
    { skip: reportType !== 'CREATOR_EARNINGS' }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  // Generate pagination buttons
  const currentReport = reportType === 'REVENUE' ? revenueReport : reportType === 'PAYOUTS' ? payoutReport : creatorEarnings;
  const totalPages = currentReport?.pagination?.totalPages || 1;

  const paginationButtons = useMemo(() => {
    const buttons: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      buttons.push(1);
      if (page > 3) buttons.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        buttons.push(i);
      }
      if (page < totalPages - 2) buttons.push('...');
      buttons.push(totalPages);
    }
    return buttons;
  }, [page, totalPages]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Comprehensive financial analytics and transaction reports</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative min-w-[200px]">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
          >
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="THIS_YEAR">This Year</option>
          </select>
          <svg
            className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {reportType === 'PAYOUTS' && (
          <div className="relative min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <svg
              className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Overview Stats */}
      {overviewLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">{overview.totalTransactions} transactions</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Payouts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(overview.totalPayouts)}</p>
                <p className="text-xs text-gray-500 mt-1">Paid to creators</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Platform Revenue</p>
                <p className="text-3xl font-bold text-indigo-600">{formatCurrency(overview.platformRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Net earnings</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Payouts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
                <p className="text-3xl font-bold text-orange-500">{formatCurrency(overview.pendingPayoutsAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{overview.pendingPayoutsCount} requests</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Payout Statistics */}
      {payoutStats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-yellow-50 rounded-lg p-4 mb-2">
                <p className="text-2xl font-bold text-yellow-700">{formatCurrency(payoutStats.pending.amount)}</p>
              </div>
              <p className="text-sm font-medium text-gray-700">Pending</p>
              <p className="text-xs text-gray-500">{payoutStats.pending.count} requests</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4 mb-2">
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(payoutStats.processing.amount)}</p>
              </div>
              <p className="text-sm font-medium text-gray-700">Processing</p>
              <p className="text-xs text-gray-500">{payoutStats.processing.count} requests</p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-2">
                <p className="text-2xl font-bold text-green-700">{formatCurrency(payoutStats.completed.amount)}</p>
              </div>
              <p className="text-sm font-medium text-gray-700">Completed</p>
              <p className="text-xs text-gray-500">{payoutStats.completed.count} requests</p>
            </div>
            <div className="text-center">
              <div className="bg-red-50 rounded-lg p-4 mb-2">
                <p className="text-2xl font-bold text-red-700">{formatCurrency(payoutStats.failed.amount)}</p>
              </div>
              <p className="text-sm font-medium text-gray-700">Failed</p>
              <p className="text-xs text-gray-500">{payoutStats.failed.count} requests</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Creators */}
      {overview?.topCreators && overview.topCreators.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Earning Creators</h3>
          <div className="space-y-3">
            {overview.topCreators.map((creator, index) => (
              <div key={creator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{creator.name}</p>
                    <p className="text-sm text-gray-500">{creator.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(creator.totalEarnings)}</p>
                  <p className="text-xs text-gray-500">Total earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Type Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setReportType('REVENUE');
            setPage(1);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            reportType === 'REVENUE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Revenue Transactions
        </button>
        <button
          onClick={() => {
            setReportType('PAYOUTS');
            setPage(1);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            reportType === 'PAYOUTS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Payout Records
        </button>
        <button
          onClick={() => {
            setReportType('CREATOR_EARNINGS');
            setPage(1);
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            reportType === 'CREATOR_EARNINGS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Creator Earnings
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {reportType === 'REVENUE' && (
          <>
            {revenueLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : revenueReport && revenueReport.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Content</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Creator</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {revenueReport.data.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-mono text-gray-900">
                              {transaction.transactionId || transaction.id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{transaction.content.title}</p>
                              <p className="text-xs text-gray-500">{formatCurrency(transaction.content.price)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{transaction.creator.name}</p>
                              <p className="text-xs text-gray-500">{transaction.creator.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(transaction.amount)}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700">{transaction.paymentProvider}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700">{formatDate(transaction.createdAt)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, revenueReport.pagination.total)} of{' '}
                    {revenueReport.pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    {paginationButtons.map((btn, idx) =>
                      typeof btn === 'number' ? (
                        <button
                          key={idx}
                          onClick={() => setPage(btn)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            page === btn
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {btn}
                        </button>
                      ) : (
                        <span key={idx} className="px-4 py-2 text-gray-500">
                          {btn}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">No revenue data available</div>
            )}
          </>
        )}

        {reportType === 'PAYOUTS' && (
          <>
            {payoutLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : payoutReport && payoutReport.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payout ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Creator</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Processed</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payoutReport.data.map((payout) => (
                        <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-mono text-gray-900">
                              {payout.paymentId || payout.id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{payout.creator.name}</p>
                              <p className="text-xs text-gray-500">{payout.creator.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(payout.amount)}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700">{payout.paymentMethod}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700">
                              {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700">{formatDate(payout.createdAt)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, payoutReport.pagination.total)} of{' '}
                    {payoutReport.pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    {paginationButtons.map((btn, idx) =>
                      typeof btn === 'number' ? (
                        <button
                          key={idx}
                          onClick={() => setPage(btn)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            page === btn
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {btn}
                        </button>
                      ) : (
                        <span key={idx} className="px-4 py-2 text-gray-500">
                          {btn}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">No payout data available</div>
            )}
          </>
        )}

        {reportType === 'CREATOR_EARNINGS' && (
          <>
            {earningsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : creatorEarnings && creatorEarnings.data.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Creator</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Earnings</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purchases</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payouts</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {creatorEarnings.data.map((creator) => (
                        <tr key={creator.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{creator.name}</p>
                              <p className="text-xs text-gray-500">{creator.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(creator.totalEarnings)}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700">{creator.totalPurchases}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-gray-700">{creator.totalPayouts}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                creator.payoutStatus === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : creator.payoutStatus === 'SUSPENDED'
                                  ? 'bg-red-100 text-red-700 border border-red-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                              }`}
                            >
                              {creator.payoutStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, creatorEarnings.pagination.total)} of{' '}
                    {creatorEarnings.pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    {paginationButtons.map((btn, idx) =>
                      typeof btn === 'number' ? (
                        <button
                          key={idx}
                          onClick={() => setPage(btn)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            page === btn
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {btn}
                        </button>
                      ) : (
                        <span key={idx} className="px-4 py-2 text-gray-500">
                          {btn}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">No creator earnings data available</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
