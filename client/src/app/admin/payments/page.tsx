'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { useGetAdminTransactionsQuery, useGetPaymentStatsQuery, useGetRevenueOverTimeQuery, AdminTransaction } from '@/state/api';
import { useLogout } from '@/hooks/useLogout';
import { useAdminAccess } from '@/hooks/useAdminAccess';

export default function PaymentsPage() {
  const { hasAccess, loading: accessLoading } = useAdminAccess({ allowedRoles: ['FINANCIAL_ADMIN'] });
  const router = useRouter();
  const [activeTab] = useState('payments');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useLogout();

  // Fetch transactions with pagination and filters
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useGetAdminTransactionsQuery({
    search: searchQuery || undefined,
    status: statusFilter,
    page: currentPage,
    limit: 10,
  });

  // Fetch payment stats
  const { data: statsData, isLoading: statsLoading } = useGetPaymentStatsQuery();

  // Map timeRange to API period
  const periodMap = { Weekly: '7' as const, Monthly: '30' as const, Yearly: '90' as const };
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueOverTimeQuery({ period: periodMap[timeRange] });

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
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

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Creator', 'Buyer Email', 'Amount', 'Currency', 'Payment Method', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.id,
        `"${t.creatorName}"`,
        t.buyerEmail,
        t.amount,
        t.currency,
        t.paymentMethod,
        t.status,
        formatDate(t.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate chart data from revenue
  const chartData = revenueData?.data
    ? revenueData.data.slice(-7).map((point, index, arr) => {
        const maxAmount = Math.max(...arr.map(p => p.amount), 1);
        const date = new Date(point.date);
        return {
          x: 50 + index * 100,
          barHeight: Math.max((point.amount / maxAmount) * 130, 10),
          lineY: 200 - Math.max((point.amount / maxAmount) * 130, 10),
          amount: point.amount,
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      })
    : Array.from({ length: 7 }, (_, i) => ({
        x: 50 + i * 100,
        barHeight: [60, 80, 100, 90, 120, 110, 130][i],
        lineY: 200 - [60, 80, 100, 90, 120, 110, 130][i],
        amount: 0,
        label: '',
      }));

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700';
      case 'PROCESSING':
        return 'bg-indigo-100 text-indigo-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Dropdown */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`p-2 border rounded-lg transition-colors ${statusFilter ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => { setStatusFilter(undefined); setShowFilterDropdown(false); setCurrentPage(1); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${!statusFilter ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                    >
                      All Status
                    </button>
                    {['COMPLETED', 'PENDING', 'FAILED', 'REJECTED', 'APPROVED', 'PROCESSING', 'REFUNDED'].map(status => (
                      <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setShowFilterDropdown(false); setCurrentPage(1); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${statusFilter === status ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>

              {/* Notification Button */}
              <button
                onClick={() => router.push('/admin/notifications')}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Admin</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => { router.push('/admin/settings'); setShowProfileDropdown(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                    <button
                      onClick={() => { logout(); setShowProfileDropdown(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
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

            {/* Rejected Payouts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Rejected Payouts</span>
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-2">
                {statsLoading ? 'Loading...' : (statsData?.rejectedPayouts || 0)}
              </p>
              <div className="h-1 bg-orange-500 rounded-full"></div>
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
              {revenueLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  <svg className="w-full h-full" viewBox="0 0 750 250">
                    {/* Grid lines */}
                    <line x1="0" y1="200" x2="750" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                    {/* Bars */}
                    {chartData.map((point, i) => (
                      <rect
                        key={`bar-${i}`}
                        x={point.x}
                        y={200 - point.barHeight}
                        width="40"
                        height={point.barHeight}
                        fill="#e5e7eb"
                        rx="2"
                        className="hover:fill-gray-300 transition-colors cursor-pointer"
                      />
                    ))}

                    {/* Revenue line */}
                    <polyline
                      points={chartData.map(p => `${p.x + 20},${p.lineY}`).join(' ')}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points with tooltips */}
                    {chartData.map((point, i) => (
                      <g key={`point-${i}`} className="group">
                        <circle
                          cx={point.x + 20}
                          cy={point.lineY}
                          r="6"
                          fill="#6366f1"
                          className="cursor-pointer hover:r-8"
                        />
                        {point.amount > 0 && (
                          <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <rect
                              x={point.x - 20}
                              y={point.lineY - 35}
                              width="80"
                              height="25"
                              fill="#1f2937"
                              rx="4"
                            />
                            <text
                              x={point.x + 20}
                              y={point.lineY - 18}
                              textAnchor="middle"
                              fill="white"
                              fontSize="12"
                            >
                              ${point.amount.toLocaleString()}
                            </text>
                          </g>
                        )}
                      </g>
                    ))}
                  </svg>

                  {/* X-axis labels */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-around px-8">
                    {chartData.map((point, i) => (
                      <span key={i} className="text-xs text-gray-500 w-12 text-center">
                        {point.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
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
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowDetailsModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline"
                            >
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

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedTransaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        selectedTransaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        selectedTransaction.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        selectedTransaction.status === 'PROCESSING' ? 'bg-indigo-100 text-indigo-800' :
                        selectedTransaction.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedTransaction.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Creator</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.creatorName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Buyer</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.buyerEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedTransaction.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Content ID</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.contentId || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
