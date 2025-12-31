'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';
import AdminSidebar from '@/components/AdminSidebar';

export default function PayoutReportsPage() {
  const router = useRouter();
  const [activeTab] = useState('payout-reports');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [statusFilter, setStatusFilter] = useState('All Statuses');


  const payouts = [
    { date: 'Oct 23, 2025', creator: '@jvelo user', amount: '$150', status: 'Completed', statusColor: 'bg-green-100 text-green-700', method: 'Bank', settlementId: 'PAY-12345' },
    { date: 'Oct 22, 2025', creator: '@ldmus', amount: '$90', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-700', method: 'Bank', settlementId: 'PAY-12344' },
    { date: 'Oct 21, 2025', creator: '@travelguy', amount: '$200', status: 'Failed', statusColor: 'bg-red-100 text-red-700', method: 'Bank', settlementId: 'PAY-12343' },
  ];


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onLogout={() => setShowLogoutModal(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-2 gap-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payout Reports / Creator Earnings</h1>
              <p className="text-sm text-gray-500">Home / Payments / Payout Reports</p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              {/* Export CSV Button */}
              <button className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>

              {/* Filter by Date Range */}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Filter by Date Range
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Creator Earnings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Total Creator Earnings</span>
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  4.2%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">$92,450</p>
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            </div>

            {/* Pending Payouts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Pending Payouts</span>
                <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  1.1%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">$4,320</p>
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            </div>

            {/* Completed Payouts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Completed Payouts</span>
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  2.8%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">1,203</p>
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            </div>

            {/* Platform Fee Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Platform Fee Revenue</span>
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  3.5%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">$8,730</p>
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 lg:mb-8">
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Creator Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Date Filter Dropdown */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Custom Range</option>
              </select>

              {/* Status Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option>All Statuses</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>

              {/* Apply Filter Button */}
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Apply Filter
              </button>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Creator</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payout Method</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Settlement ID</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">{payout.date}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{payout.creator}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{payout.amount}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${payout.statusColor}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{payout.method}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{payout.settlementId}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <button className="text-gray-600 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Payout Trends */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Payout Trends (8 Weeks)</h2>

              {/* Chart Area */}
              <div className="h-64 border border-gray-200 rounded-lg bg-gray-50 relative">
                <svg className="w-full h-full" viewBox="0 0 400 250">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                  {/* Purple trend line */}
                  <polyline
                    points="40,180 90,160 140,140 190,150 240,120 290,130 340,100"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  <circle cx="40" cy="180" r="4" fill="#8b5cf6" />
                  <circle cx="90" cy="160" r="4" fill="#8b5cf6" />
                  <circle cx="140" cy="140" r="4" fill="#8b5cf6" />
                  <circle cx="190" cy="150" r="4" fill="#8b5cf6" />
                  <circle cx="240" cy="120" r="4" fill="#8b5cf6" />
                  <circle cx="290" cy="130" r="4" fill="#8b5cf6" />
                  <circle cx="340" cy="100" r="4" fill="#8b5cf6" />
                </svg>

                <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                  Line chart placeholder — Purple line with subtle grid, X: Week, Y: Amount
                </div>
              </div>
            </div>

            {/* Payout Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Payout Distribution</h2>

              {/* Chart Area */}
              <div className="h-64 border border-gray-200 rounded-lg bg-gray-50 relative flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100">
                    {/* Pie chart segments */}
                    <circle cx="50" cy="50" r="40" fill="#6366f1" />
                    <path d="M50 50 L50 10 A40 40 0 0 1 86.6 65 Z" fill="#8b5cf6" />
                    <path d="M50 50 L86.6 65 A40 40 0 0 1 50 90 Z" fill="#a78bfa" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Pie chart placeholder — Bank (60%), PayPal (25%), Stripe (15%) + legend right
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Last Updated: 10 mins ago</p>
            <Link href="/admin/payments" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-2">
              View Transactions Overview
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
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
