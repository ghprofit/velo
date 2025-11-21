'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data for creators
const mockCreators = [
  {
    id: 'CR-001847',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    kycStatus: 'Verified',
    payoutStatus: 'Active',
    policyStrikes: 0,
    lifetimeEarnings: 24567,
    lastLogin: '2 hours ago',
  },
  {
    id: 'CR-001523',
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@email.com',
    kycStatus: 'Failed',
    payoutStatus: 'On Hold',
    policyStrikes: 1,
    lifetimeEarnings: 8942,
    lastLogin: '1 day ago',
  },
  {
    id: 'CR-002156',
    name: 'Emma Chen',
    email: 'emma.chen@email.com',
    kycStatus: 'Pending',
    payoutStatus: 'Active',
    policyStrikes: 0,
    lifetimeEarnings: 15234,
    lastLogin: '5 hours ago',
  },
  {
    id: 'CR-000892',
    name: 'Michael Johnson',
    email: 'michael.johnson@email.com',
    kycStatus: 'Verified',
    payoutStatus: 'Suspended',
    policyStrikes: 3,
    lifetimeEarnings: 45678,
    lastLogin: '3 days ago',
  },
];

export default function CreatorManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [payoutFilter, setPayoutFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [strikesFilter, setStrikesFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const totalCreators = 12847;
  const creatorsPerPage = 20;
  const totalPages = Math.ceil(totalCreators / creatorsPerPage);

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Failed':
        return 'bg-red-100 text-red-600 border border-red-300';
      case 'Pending':
        return 'bg-orange-100 text-orange-600 border border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'On Hold':
        return 'bg-red-100 text-red-600 border border-red-300';
      case 'Suspended':
        return 'bg-orange-100 text-orange-600 border border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Creator Directory</h1>
          <p className="text-gray-500 mt-1">Comprehensive overview of all platform creators</p>
        </div>
        <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Full Database
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
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
            placeholder="Search by Name, Email, Creator ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          />
        </div>

        <div className="relative min-w-[160px]">
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
          >
            <option value="all">All KYC Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
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

        <div className="relative min-w-[160px]">
          <select
            value={payoutFilter}
            onChange={(e) => setPayoutFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Payout Status</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="suspended">Suspended</option>
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

        <div className="relative min-w-[160px]">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
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

        <div className="relative min-w-[160px]">
          <select
            value={strikesFilter}
            onChange={(e) => setStrikesFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Policy Strikes</option>
            <option value="0">0 Strikes</option>
            <option value="1">1 Strike</option>
            <option value="2">2 Strikes</option>
            <option value="3+">3+ Strikes</option>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Creators */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Creators</p>
              <p className="text-3xl font-bold text-gray-900">12,847</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Creators On Payout Hold */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Creators On Payout Hold</p>
              <p className="text-3xl font-bold text-orange-500">127</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>

        {/* KYC Failed/Pending */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">KYC Failed/Pending</p>
              <p className="text-3xl font-bold text-orange-500">89</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Highest Policy Strikes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Highest Policy Strikes</p>
              <p className="text-3xl font-bold text-red-500">3</p>
              <p className="text-xs text-gray-500">5 accounts</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Creators Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Creator ID / Name</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Email Address</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">KYC Status</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Payout Status</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Policy Strikes</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Lifetime Earnings</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Last Login</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockCreators.map((creator) => (
                <tr key={creator.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold text-gray-900">{creator.id}</div>
                      <div className="text-sm text-gray-500">{creator.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">{creator.email}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getKycStatusColor(creator.kycStatus)}`}>
                      {creator.kycStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPayoutStatusColor(creator.payoutStatus)}`}>
                      {creator.payoutStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-900">{creator.policyStrikes}</td>
                  <td className="py-4 px-6 text-center text-gray-900 font-medium">
                    ${creator.lifetimeEarnings.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">{creator.lastLogin}</td>
                  <td className="py-4 px-6 text-center">
                    <Link
                      href={`/superadmin/creator/${creator.id}`}
                      className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Audit Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Showing 1 to {creatorsPerPage} of {totalCreators.toLocaleString()} results
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="text-gray-500">...</span>
            <button
              onClick={() => setCurrentPage(643)}
              className="w-10 h-10 rounded-lg font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
            >
              643
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
