'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';
import AdminSidebar from '@/components/AdminSidebar';
import {
  useGetDashboardStatsQuery,
  useGetRevenueOverTimeQuery,
  useGetRecentActivityQuery,
  useGetPaymentStatsQuery,
  useGetAdminCreatorStatsQuery,
  useGetAdminContentStatsQuery,
} from '@/state/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsAnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('reports');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<'7' | '30' | '90'>('30');

  // Fetch real data
  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: revenueData } = useGetRevenueOverTimeQuery({ period: revenuePeriod });
  const { data: recentActivity } = useGetRecentActivityQuery();
  const { data: paymentStats } = useGetPaymentStatsQuery();
  const { data: creatorStats } = useGetAdminCreatorStatsQuery();
  const { data: contentStats } = useGetAdminContentStatsQuery();

  // Export report as CSV
  const exportReportAsCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', `$${paymentStats?.totalRevenue.toFixed(2) || 0}`],
      ['Active Creators', creatorStats?.data?.totalCreators || 0],
      ['Total Content', contentStats?.data?.totalContent || 0],
      ['Avg Transaction', `$${dashboardStats?.avgTransactionValue?.toFixed(2) || 0}`],
      ['Total Transactions', dashboardStats?.totalTransactions || 0],
      ['Pending Review', contentStats?.data?.pendingReview || 0],
      ['Approved Content', contentStats?.data?.approved || 0],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onLogout={() => setShowLogoutModal(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ml-12 lg:ml-0">Reports & Analytics</h1>
            <div className="hidden lg:flex items-center gap-4">
              {/* Revenue Period Selector */}
              <select
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value as '7' | '30' | '90')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>

              {/* Download Report Button */}
              <button
                onClick={exportReportAsCSV}
                className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Report
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
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm text-gray-600">Total Revenue</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  ${paymentStats?.totalRevenue.toFixed(2) || '0.00'}
                </p>
              )}
              <p className="text-sm text-gray-500">all time</p>
            </div>

            {/* Active Creators */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm text-gray-600">Active Creators</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {creatorStats?.data?.totalCreators || 0}
                </p>
              )}
              <p className="text-sm text-gray-500">total creators</p>
            </div>

            {/* Content Uploaded */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">Total Content</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {contentStats?.data?.totalContent || 0}
                </p>
              )}
              <p className="text-sm text-gray-500">all content items</p>
            </div>

            {/* Avg. Transaction Value */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">Avg. Transaction</span>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  ${dashboardStats?.avgTransactionValue?.toFixed(2) || '0.00'}
                </p>
              )}
              <p className="text-sm text-gray-500">per transaction</p>
            </div>
          </div>

          {/* Additional Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Total Transactions</span>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalTransactions || 0}</p>
            </div>

            {/* Pending Review */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Pending Review</span>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{contentStats?.data?.pendingReview || 0}</p>
            </div>

            {/* Approved Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Approved Content</span>
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{contentStats?.data?.approved || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Revenue Trends */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Revenue Trends</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRevenuePeriod('7')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenuePeriod === '7'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setRevenuePeriod('30')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenuePeriod === '30'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    onClick={() => setRevenuePeriod('90')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenuePeriod === '90'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    90 Days
                  </button>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="h-80">
                {!revenueData?.dataPoints || revenueData.dataPoints.length === 0 ? (
                  <div className="h-full border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-500">No revenue data available for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData.dataPoints} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString();
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ fill: '#4f46e5', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Platform Metrics</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Payouts</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${paymentStats?.totalPayouts.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${((paymentStats?.totalPayouts || 0) / (paymentStats?.totalRevenue || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Pending Payouts</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      ${paymentStats?.pendingPayouts.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Failed Transactions</span>
                    <span className="text-sm font-semibold text-red-600">
                      {paymentStats?.failedTransactions || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Platform Revenue</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${((paymentStats?.totalRevenue || 0) - (paymentStats?.totalPayouts || 0)).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Revenue minus payouts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h2>
              <span className="text-sm text-gray-500">Last 10 activities</span>
            </div>

            {!recentActivity || recentActivity.data.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.data.slice(0, 10).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description || 'Activity'}</p>
                      <p className="text-sm text-gray-500 mt-1">{activity.type || 'System Event'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportReportAsCSV}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
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
