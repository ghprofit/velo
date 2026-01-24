'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import {
  useGetAnalyticsOverviewQuery,
  useGetCreatorPerformanceQuery,
  useGetRevenueTrendsQuery,
  useGetUserGrowthQuery,
  useGetContentPerformanceQuery,
  useGetGeographicDistributionQuery
} from '@/state/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { exportToCSV, exportToPDF } from '@/utils/export-utils';
import { useAdminAccess } from '@/hooks/useAdminAccess';

export default function ReportsAnalyticsPage() {
  const { hasAccess, loading: accessLoading } = useAdminAccess({ allowedRoles: ['ANALYTICS_ADMIN', 'FINANCIAL_ADMIN'] });
  const router = useRouter();
  const [activeTab] = useState('reports');
  const [timeRange, setTimeRange] = useState('This Month');
  const [metricsFilter, setMetricsFilter] = useState('All Metrics');
  const [revenueTrend, setRevenueTrend] = useState<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [userGrowthView, setUserGrowthView] = useState<'CREATORS' | 'BUYERS'>('CREATORS');
  const [reportFilter, setReportFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useGetAnalyticsOverviewQuery();
  const { data: performanceData, isLoading: performanceLoading } = useGetCreatorPerformanceQuery({
    limit: 10,
    sortBy: 'revenue',
  });
  const { data: revenueTrendsData, isLoading: revenueTrendsLoading } = useGetRevenueTrendsQuery({
    period: revenueTrend,
  });
  const { data: userGrowthData, isLoading: userGrowthLoading } = useGetUserGrowthQuery({
    userType: userGrowthView,
  });
  const { data: contentPerformanceData, isLoading: contentPerformanceLoading } = useGetContentPerformanceQuery();
  const { data: geographicData, isLoading: geographicLoading } = useGetGeographicDistributionQuery({
    limit: 10,
  });

  const analytics = analyticsData?.data;
  const reportData = performanceData?.data || [];
  const revenueChartData = revenueTrendsData?.data || [];
  const userGrowthChartData = userGrowthData?.data || [];

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
  const contentPerfData = contentPerformanceData?.data || [];
  const geoData = geographicData?.data || [];

  // Filter report data based on search and category filter
  const filteredReportData = reportData.filter((item) => {
    const matchesSearch = searchQuery === '' || item.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = reportFilter === 'All' || reportFilter === 'Filter: All' || item.category === reportFilter;
    return matchesSearch && matchesCategory;
  });

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

  // Export handlers
  const handleExportCSV = () => {
    const exportData = filteredReportData.map((item, index) => ({
      Rank: index + 1,
      'Creator Name': item.creatorName,
      'Total Views': item.totalViews,
      'Revenue (USD)': item.totalRevenue,
      'Engagement Rate': `${item.engagement.toFixed(1)}%`,
      Category: item.category,
    }));
    exportToCSV(exportData, 'creator-performance-report');
  };

  const handleExportPDF = async () => {
    const exportData = filteredReportData.map((item, index) => ({
      Rank: index + 1,
      Creator: item.creatorName,
      Views: formatNumber(item.totalViews),
      Revenue: formatCurrency(item.totalRevenue),
      Engagement: `${item.engagement.toFixed(1)}%`,
      Category: item.category,
    }));
    await exportToPDF(exportData, 'creator-performance-report', 'Creator Performance Report');
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
              <button
                onClick={handleExportPDF}
                className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
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

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search creators by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Conditionally render charts based on metrics filter */}
          {(metricsFilter === 'All Metrics' || metricsFilter === 'Revenue Only') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Revenue Trends */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Revenue Trends</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRevenueTrend('WEEKLY')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenueTrend === 'WEEKLY'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setRevenueTrend('MONTHLY')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenueTrend === 'MONTHLY'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setRevenueTrend('YEARLY')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      revenueTrend === 'YEARLY'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-64">
                {revenueTrendsLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Loading chart data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
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
                {geographicLoading ? (
                  <div className="text-center text-gray-500 py-4">Loading...</div>
                ) : geoData.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No geographic data available</div>
                ) : (
                  geoData.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-indigo-600' : index === 1 ? 'bg-indigo-500' : 'bg-indigo-400'}`}></div>
                        <span className="text-sm text-gray-900">{item.country || 'Unknown'}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          )}

          {(metricsFilter === 'All Metrics' || metricsFilter === 'User Growth') && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            {/* User Growth */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">User Growth</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUserGrowthView('CREATORS')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userGrowthView === 'CREATORS'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Creators
                </button>
                <button
                  onClick={() => setUserGrowthView('BUYERS')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userGrowthView === 'BUYERS'
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
              {userGrowthLoading ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Loading chart data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowthChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <Tooltip
                      formatter={(value) => [value, userGrowthView]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#a78bfa"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          )}

          {/* Content Performance */}
          {(metricsFilter === 'All Metrics' || metricsFilter === 'Content Performance') && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Content Performance</h2>
                <span className="text-sm text-gray-500">Music • Video • Podcast • Courses • Images</span>
              </div>

              {/* Pie Chart */}
              <div className="h-64">
                {contentPerformanceLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Loading chart data...
                  </div>
                ) : contentPerfData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No content data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentPerfData.map((item) => ({
                          name: item.contentType,
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contentPerfData.map((entry, index) => {
                          const colors = ['#a78bfa', '#6366f1', '#4338ca', '#818cf8', '#9ca3af'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Count']} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
          </div>
          )}

          {/* Key Report Data Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Key Report Data</h2>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="All">Filter: All</option>
                <option value="Video">Video</option>
                <option value="Music">Music</option>
                <option value="Podcast">Podcast</option>
                <option value="Images">Images</option>
                <option value="Digital Content">Digital Content</option>
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
                  ) : filteredReportData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-600">
                        {searchQuery || reportFilter !== 'All' ? 'No results found' : 'No creator performance data available'}
                      </td>
                    </tr>
                  ) : (
                    filteredReportData.map((item, index) => (
                      <tr key={item.creatorId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{item.creatorName}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatNumber(item.totalViews)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatCurrency(item.totalRevenue)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{item.engagement.toFixed(1)}%</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{item.category}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => router.push(`/admin/creators/${item.creatorId}`)}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline"
                          >
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
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
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
