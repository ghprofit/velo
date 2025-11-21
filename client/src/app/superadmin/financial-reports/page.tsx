'use client';

import { useState } from 'react';

// Mock transaction data
const mockTransactions = [
  {
    id: '1',
    date: 'Dec 15, 2024 14:32',
    creatorId: 'CR-8472',
    creatorName: 'Sarah Mitchell',
    grossAmount: 1250.00,
    platformFee: 250.00,
    netPayout: 1000.00,
    status: 'Completed',
  },
  {
    id: '2',
    date: 'Dec 15, 2024 13:18',
    creatorId: 'CR-9234',
    creatorName: 'Marcus Johnson',
    grossAmount: 875.50,
    platformFee: 175.10,
    netPayout: 700.40,
    status: 'Completed',
  },
  {
    id: '3',
    date: 'Dec 15, 2024 11:45',
    creatorId: 'CR-7621',
    creatorName: 'Emma Rodriguez',
    grossAmount: 2100.00,
    platformFee: 420.00,
    netPayout: 1680.00,
    status: 'Pending',
  },
  {
    id: '4',
    date: 'Dec 15, 2024 10:22',
    creatorId: 'CR-5489',
    creatorName: 'David Chen',
    grossAmount: 650.00,
    platformFee: 130.00,
    netPayout: 520.00,
    status: 'Completed',
  },
  {
    id: '5',
    date: 'Dec 15, 2024 09:15',
    creatorId: 'CR-3287',
    creatorName: 'Jessica Taylor',
    grossAmount: 1450.00,
    platformFee: 290.00,
    netPayout: 1160.00,
    status: 'Completed',
  },
  {
    id: '6',
    date: 'Dec 14, 2024 16:48',
    creatorId: 'CR-2945',
    creatorName: 'Ryan Parker',
    grossAmount: 3200.00,
    platformFee: 640.00,
    netPayout: 2560.00,
    status: 'Completed',
  },
  {
    id: '7',
    date: 'Dec 14, 2024 15:33',
    creatorId: 'CR-8156',
    creatorName: 'Olivia Martinez',
    grossAmount: 425.00,
    platformFee: 85.00,
    netPayout: 340.00,
    status: 'Failed',
  },
  {
    id: '8',
    date: 'Dec 14, 2024 14:20',
    creatorId: 'CR-6743',
    creatorName: 'Michael Brown',
    grossAmount: 980.00,
    platformFee: 196.00,
    netPayout: 784.00,
    status: 'Completed',
  },
];

export default function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('today');
  const [timeView, setTimeView] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Pending':
        return 'bg-orange-100 text-orange-600 border border-orange-300';
      case 'Failed':
        return 'bg-red-100 text-red-600 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  return (
    <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Reports Hub</h1>
              <p className="text-gray-500 mt-1">Comprehensive financial analytics and reconciliation tools</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <svg
                  className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Financial Data (CSV)
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Gross Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Gross Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">$847,293</p>
              <p className="text-sm">
                <span className="text-green-600">↑ 12.5%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </p>
            </div>

            {/* Net Platform Profit */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Net Platform Profit</p>
              <p className="text-3xl font-bold text-green-600 mb-1">$169,459</p>
              <p className="text-sm">
                <span className="text-green-600">↑ 8.3%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </p>
            </div>

            {/* Total Creator Payouts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Total Creator Payouts</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">$677,834</p>
              <p className="text-sm">
                <span className="text-green-600">↑ 14.2%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </p>
            </div>

            {/* Chargebacks/Refunds */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Chargebacks/Refunds</p>
              <p className="text-3xl font-bold text-red-500 mb-1">$12,847</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">23 cases</span>
                <span className="text-xs text-gray-500">• 1.5% of revenue</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'revenue'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Revenue & Commission
              </button>
              <button
                onClick={() => setActiveTab('payout')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'payout'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payout Audit
              </button>
              <button
                onClick={() => setActiveTab('transaction')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'transaction'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Transaction Log
              </button>
              <button
                onClick={() => setActiveTab('chargeback')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'chargeback'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Chargeback/Risk
              </button>
            </div>

            {/* Revenue & Commission Overview */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Revenue & Commission Overview</h3>
                  <p className="text-gray-500 text-sm">Breakdown of platform earnings and payouts</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTimeView('daily')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      timeView === 'daily' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTimeView('weekly')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      timeView === 'weekly' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimeView('monthly')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      timeView === 'monthly' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Revenue chart visualization would appear here</p>
              </div>
            </div>
          </div>

          {/* Detailed Transaction Data */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Detailed Transaction Data</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by Creator ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <svg
                    className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="relative">
                  <select
                    value={amountFilter}
                    onChange={(e) => setAmountFilter(e.target.value)}
                    className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Amounts</option>
                    <option value="0-500">$0 - $500</option>
                    <option value="500-1000">$500 - $1000</option>
                    <option value="1000+">$1000+</option>
                  </select>
                  <svg
                    className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Transaction Date</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Creator ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Creator Name</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Gross Amount</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Platform Fee</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Net Payout</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-600">{transaction.date}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{transaction.creatorId}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {transaction.creatorName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-gray-900 font-medium">{transaction.creatorName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-900">${transaction.grossAmount.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center text-green-600 font-medium">${transaction.platformFee.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center text-gray-900 font-medium">${transaction.netPayout.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
