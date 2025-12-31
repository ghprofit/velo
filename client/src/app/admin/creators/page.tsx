'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  useLogoutUserMutation,
  useGetAdminCreatorsQuery,
  useGetAdminCreatorStatsQuery,
} from '@/state/api';
import { clearAuth } from '@/state/authSlice';
import { RootState } from '@/app/redux';
import AdminSidebar from '@/components/AdminSidebar';
import LogoutModal from '@/components/LogoutModal';

export default function CreatorManagementPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutUser] = useLogoutUserMutation();
  const activeTab = 'creators';
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [kycFilter, setKycFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const refreshToken = useSelector((state: RootState) => state.auth.tokens?.refreshToken);
  const creatorsPerPage = 20;

  // Fetch creators and stats
  const { data: creatorsData, isLoading, error } = useGetAdminCreatorsQuery({
    search: searchQuery || undefined,
    kycStatus: kycFilter,
    accountStatus: accountFilter,
    page: currentPage,
    limit: creatorsPerPage,
  });

  const { data: statsData } = useGetAdminCreatorStatsQuery();

  const creators = creatorsData?.data || [];
  const pagination = creatorsData?.pagination;
  const totalCreators = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const stats = statsData?.data || {
    totalCreators: 0,
    activeCreators: 0,
    suspendedCreators: 0,
    kycPending: 0,
    kycVerified: 0,
    kycFailed: 0,
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logoutUser(refreshToken).unwrap();
      }
    } catch {
      // Silently handle API errors
    } finally {
      dispatch(clearAuth());
      router.push('/login');
      setShowLogoutModal(false);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED':
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAccountStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} onLogout={() => setShowLogoutModal(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Creator Management</h1>
              <p className="text-gray-600">Manage and oversee all creators on the platform</p>
            </div>
            <button className="hidden lg:flex px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors items-center gap-2 text-xs sm:text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
          </div>

          {/* Search and Filters */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full"
              />
            </div>

            {/* KYC Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">KYC:</label>
              <select
                value={kycFilter}
                onChange={(e) => {
                  setKycFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Account Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={accountFilter}
                onChange={(e) => {
                  setAccountFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Creators */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Creators</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCreators.toLocaleString()}</p>
            </div>

            {/* Active Creators */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Active Creators</h3>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeCreators.toLocaleString()}</p>
            </div>

            {/* Suspended Creators */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Suspended Creators</h3>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.suspendedCreators}</p>
            </div>

            {/* Pending KYC */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Pending KYC</h3>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.kycPending}</p>
            </div>
          </div>

          {/* Creator Directory */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Creator Directory</h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading creators...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-500">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Failed to load creators. Please try again.
              </div>
            ) : creators.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No creators found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Profile</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Email Address</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">KYC Status</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Account Status</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Join Date</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Last Login</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creators.map((creator) => (
                        <tr key={creator.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {getInitials(creator.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{creator.name}</p>
                                <p className="text-xs text-gray-500">ID: {creator.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{creator.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKycStatusColor(creator.kycStatus)}`}>
                              {formatStatus(creator.kycStatus)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccountStatusColor(creator.accountStatus)}`}>
                              {formatStatus(creator.accountStatus)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{formatDate(creator.joinDate)}</td>
                          <td className="py-4 px-4 text-sm text-gray-600">{formatLastLogin(creator.lastLogin)}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => router.push(`/admin/creators/${creator.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * creatorsPerPage) + 1} to {Math.min(currentPage * creatorsPerPage, totalCreators)} of {totalCreators.toLocaleString()} Creators
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    {totalPages > 3 && <span className="text-gray-500">...</span>}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
