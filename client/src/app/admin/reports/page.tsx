'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useGetAnalyticsOverviewQuery, useGetCreatorPerformanceQuery } from '@/state/api';

export default function ReportsAnalyticsPage() {
  const [activeTab] = useState('reports');
  const [timeRange, setTimeRange] = useState('This Month');
  const [metricsFilter, setMetricsFilter] = useState('All Metrics');
  const [revenueTrend, setRevenueTrend] = useState('Monthly');
  const [userGrowthView, setUserGrowthView] = useState('Creators');
  const [reportFilter, setReportFilter] = useState('All');

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useGetAnalyticsOverviewQuery();
  const { data: performanceData, isLoading: performanceLoading } = useGetCreatorPerformanceQuery({
    limit: 10,
    sortBy: 'revenue',
  });

  const analytics = analyticsData?.data;
  const reportData = performanceData?.data || [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format large numbers (views)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ml-12 lg:ml-0">Reports & Analytics</h1>
            <div className="hidden lg:flex items-center gap-4">
              {/* Time Range Dropdown */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white flex items-center gap-2"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>

              {/* Metrics Filter */}
              <select
                value={metricsFilter}
                onChange={(e) => setMetricsFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option>All Metrics</option>
                <option>Revenue Only</option>
                <option>User Growth</option>
                <option>Content Performance</option>
              </select>

              {/* Download Report Button */}
              <button className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Report
              </button>

              {/* Notification Bell */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
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
                {analyticsLoading ? null : (
                  <span className={`ml-auto px-2 py-1 text-xs font-semibold rounded flex items-center gap-1 ${
                    (analytics?.revenueGrowth || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        (analytics?.revenueGrowth || 0) >= 0
                          ? "M5 10l7-7m0 0l7 7m-7-7v18"
                          : "M19 14l-7 7m0 0l-7-7m7 7V3"
                      } />
                    </svg>
                    {Math.abs(analytics?.revenueGrowth || 0).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {analyticsLoading ? 'Loading...' : formatCurrency(analytics?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-500">this month</p>
            </div>

            {/* Active Creator */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm text-gray-600">Active Creators</span>
                {analyticsLoading ? null : (
                  <span className={`ml-auto px-2 py-1 text-xs font-semibold rounded flex items-center gap-1 ${
                    (analytics?.creatorsGrowth || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        (analytics?.creatorsGrowth || 0) >= 0
                          ? "M5 10l7-7m0 0l7 7m-7-7v18"
                          : "M19 14l-7 7m0 0l-7-7m7 7V3"
                      } />
                    </svg>
                    {Math.abs(analytics?.creatorsGrowth || 0).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {analyticsLoading ? 'Loading...' : (analytics?.activeCreators || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">growth vs last month</p>
            </div>

            {/* Content Uploaded */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">Content Uploaded</span>
                {analyticsLoading ? null : (
                  <span className={`ml-auto px-2 py-1 text-xs font-semibold rounded flex items-center gap-1 ${
                    (analytics?.contentGrowth || 0) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        (analytics?.contentGrowth || 0) >= 0
                          ? "M5 10l7-7m0 0l7 7m-7-7v18"
                          : "M19 14l-7 7m0 0l-7-7m7 7V3"
                      } />
                    </svg>
                    {Math.abs(analytics?.contentGrowth || 0).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {analyticsLoading ? 'Loading...' : (analytics?.contentUploaded || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">this month</p>
            </div>

            {/* Avg. Transaction Value */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">Avg. Transaction Value</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {analyticsLoading ? 'Loading...' : formatCurrency(analytics?.avgTransactionValue || 0)}
              </p>
              <p className="text-sm text-gray-500">last 30 days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Revenue Trends */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Revenue Trends</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRevenueTrend('Weekly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenueTrend === 'Weekly'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setRevenueTrend('Monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenueTrend === 'Monthly'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setRevenueTrend('Yearly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenueTrend === 'Yearly'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 700 250">
                  {/* Grid lines */}
                  <line x1="0" y1="200" x2="700" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                  {/* Purple line */}
                  <polyline
                    points="60,180 120,170 180,160 240,155 300,145 360,140 420,135 480,125 540,120 600,115 660,110"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660].map((x, i) => {
                    const y = 180 - i * 7;
                    return <circle key={i} cx={x} cy={y} r="5" fill="#6366f1" />;
                  })}
                </svg>

                <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                  X: Time • Y: USD
                </div>
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top Countries</h2>
                <span className="text-sm text-gray-500">Key buyer regions</span>
              </div>

              {/* Map Placeholder */}
              <div className="mb-6 h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-full h-full opacity-20" viewBox="0 0 200 150">
                    <rect x="20" y="30" width="160" height="90" fill="#cbd5e1" rx="4"/>
                    <circle cx="50" cy="60" r="3" fill="#6366f1"/>
                    <circle cx="120" cy="80" r="3" fill="#6366f1"/>
                    <circle cx="90" cy="70" r="3" fill="#6366f1"/>
                  </svg>
                </div>
              </div>

              {/* Country List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span className="text-sm text-gray-900">USA</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">48%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span className="text-sm text-gray-900">UK</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="text-sm text-gray-900">Canada</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">14%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* User Growth */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">User Growth</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserGrowthView('Creators')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userGrowthView === 'Creators'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Creators
                  </button>
                  <button
                    onClick={() => setUserGrowthView('Buyers')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userGrowthView === 'Buyers'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Buyers
                  </button>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-64">
                <svg className="w-full h-full" viewBox="0 0 600 250">
                  {/* Bars */}
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((month, i) => {
                    const height = 80 + i * 10;
                    const x = 40 + i * 45;
                    return (
                      <g key={i}>
                        <rect x={x} y={200 - height} width="30" height={height} fill="#a78bfa" rx="4"/>
                        <text x={x + 15} y="230" textAnchor="middle" fontSize="12" fill="#6b7280">{month}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Content Performance */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Content Performance</h2>
                <span className="text-sm text-gray-500">Music • Video • Podcast • Courses • Images</span>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">Music</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Video</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-700 rounded-full"></div>
                  <span className="text-sm text-gray-700">Podcast</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">Images</span>
                </div>
              </div>

              {/* Placeholder chart area */}
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">Chart visualization placeholder</p>
              </div>
            </div>
          </div>

          {/* Key Report Data Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Key Report Data</h2>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option>Filter: All</option>
                <option>Video</option>
                <option>Music</option>
                <option>Podcast</option>
                <option>Images</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">#</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Creator Name</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Total Views</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Revenue (USD)</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Engagement Rate</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-600">
                        Loading creator performance data...
                      </td>
                    </tr>
                  ) : reportData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-600">
                        No creator performance data available
                      </td>
                    </tr>
                  ) : (
                    reportData.map((item, index) => (
                      <tr key={item.creatorId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{item.creatorName}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatNumber(item.totalViews)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatCurrency(item.totalRevenue)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{item.engagement.toFixed(1)}%</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{item.category}</td>
                        <td className="py-4 px-4">
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline">
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">Last updated: October 23, 2025</p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as PDF
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
