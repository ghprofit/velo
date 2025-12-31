'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetFinancialOverviewQuery,
  useGetCreatorStatsQuery,
  useGetContentStatsQuery,
} from '@/state/api';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH'>('LAST_30_DAYS');

  // Fetch dashboard data
  const { data: financialData, isLoading: loadingFinancial } = useGetFinancialOverviewQuery({ timeRange });
  const { data: creatorStats, isLoading: loadingCreators } = useGetCreatorStatsQuery();
  const { data: contentStats, isLoading: loadingContent } = useGetContentStatsQuery();

  const isLoading = loadingFinancial || loadingCreators || loadingContent;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format compact numbers
  const formatCompact = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and critical metrics</p>
        </div>
        
        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="LAST_7_DAYS">Last 7 Days</option>
          <option value="LAST_30_DAYS">Last 30 Days</option>
          <option value="THIS_MONTH">This Month</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Total Platform Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Platform Revenue</p>
                  <p className="text-xs text-gray-500">
                    {timeRange === 'LAST_7_DAYS' ? 'Last 7 Days' : timeRange === 'LAST_30_DAYS' ? 'Last 30 Days' : 'This Month'}
                  </p>
                  <p className="text-3xl font-bold text-green-500 mt-2">
                    {formatCurrency(financialData?.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-green-500 mt-1">
                    <span className="inline-block">↑</span> {financialData?.totalTransactions || 0} transactions
                  </p>
                </div>
              </div>
            </div>

            {/* Net Platform Commission */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Platform Commission</p>
                  <p className="text-xs text-gray-500">
                    {timeRange === 'LAST_7_DAYS' ? 'Last 7 Days' : timeRange === 'LAST_30_DAYS' ? 'Last 30 Days' : 'This Month'}
                  </p>
                  <p className="text-3xl font-bold text-green-500 mt-2">
                    {formatCurrency(financialData?.platformRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Avg: {formatCurrency(financialData?.avgTransactionValue || 0)}
                  </p>
                </div>
                <div className="text-green-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Payouts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending Payouts</p>
                  <p className="text-xs text-gray-500">Requires Action</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {financialData?.pendingPayoutsCount || 0}
                  </p>
                  <p className="text-sm text-orange-500 mt-1 flex items-center gap-1">
                    {formatCurrency(financialData?.pendingPayoutsAmount || 0)}
                  </p>
                </div>
                <div className="text-yellow-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Creators */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Creators</p>
                  <p className="text-xs text-gray-500">Platform-wide</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCompact(creatorStats?.data.totalCreators || 0)}
                  </p>
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    {creatorStats?.data.highStrikes || 0} high strikes
                  </p>
                </div>
                <div className="text-gray-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content Pending Review */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Content Review</p>
                  <p className="text-xs text-gray-500">Pending Items</p>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {contentStats?.data.pendingReview || 0}
                    </p>
                  </div>
                  <p className="text-sm text-red-600 mt-2">
                    {contentStats?.data.flagged || 0} flagged
                  </p>
                </div>
                <div className="text-orange-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Earning Creators */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Top Earning Creators</h2>

              <div className="space-y-4">
                {financialData?.topCreators && financialData.topCreators.length > 0 ? (
                  financialData.topCreators.slice(0, 5).map((creator, index) => (
                    <div key={creator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{creator.name}</p>
                          <p className="text-sm text-gray-500">{creator.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(creator.totalEarnings)}</p>
                        <p className="text-xs text-gray-500">Total Earnings</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No creator data available</p>
                )}
              </div>
            </div>

            {/* Critical Actions Required */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Critical Actions Required</h2>

              <div className="space-y-4">
                {/* Pending Payouts */}
                {financialData && financialData.pendingPayoutsCount > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-orange-500 mt-0.5">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-600">Pending Payouts</p>
                        <p className="text-sm text-orange-500">
                          {financialData.pendingPayoutsCount} payouts worth {formatCurrency(financialData.pendingPayoutsAmount)} pending
                        </p>
                        <button 
                          onClick={() => router.push('/superadmin/financial-reports')}
                          className="text-xs text-orange-600 font-medium mt-2 hover:underline"
                        >
                          Review Now →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flagged Content */}
                {contentStats && contentStats.data.flagged > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-red-500 mt-0.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-600">Flagged Content</p>
                        <p className="text-sm text-red-500">
                          {contentStats.data.flagged} items require immediate moderation
                        </p>
                        <button 
                          onClick={() => router.push('/superadmin/content')}
                          className="text-xs text-red-600 font-medium mt-2 hover:underline"
                        >
                          Review Now →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Content Review */}
                {contentStats && contentStats.data.pendingReview > 0 && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-yellow-500 mt-0.5">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-600">Content Awaiting Review</p>
                        <p className="text-sm text-yellow-500">
                          {contentStats.data.pendingReview} items pending moderation
                        </p>
                        <button 
                          onClick={() => router.push('/superadmin/content')}
                          className="text-xs text-yellow-600 font-medium mt-2 hover:underline"
                        >
                          Review Now →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* High Strikes Creators */}
                {creatorStats && creatorStats.data.highStrikes > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-red-500 mt-0.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-600">Creators with High Strikes</p>
                        <p className="text-sm text-red-500">
                          {creatorStats.data.highStrikes} creators need review
                        </p>
                        <button 
                          onClick={() => router.push('/superadmin/creators')}
                          className="text-xs text-red-600 font-medium mt-2 hover:underline"
                        >
                          Review Now →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/superadmin/creators')}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Manage Creators</p>
                  <p className="text-xs text-gray-500">View all creators</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/superadmin/content')}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="text-purple-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Review Content</p>
                  <p className="text-xs text-gray-500">Moderate content</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/superadmin/financial-reports')}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <div className="text-green-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Financial Reports</p>
                  <p className="text-xs text-gray-500">View reports</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/superadmin/settings')}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all"
              >
                <div className="text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Platform Settings</p>
                  <p className="text-xs text-gray-500">Configure platform</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
