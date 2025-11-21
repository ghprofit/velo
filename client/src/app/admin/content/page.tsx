'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import LogoutModal from '@/components/LogoutModal';

export default function ContentManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [contentTab, setContentTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Most Recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const contentItems = [
    {
      id: 1,
      thumbnail: '/content-thumb-1.jpg',
      title: 'Midnight Streets — Neon City D...',
      creator: 'velo user',
      uploadDate: '2025-10-12',
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-700',
      views: '24,589',
    },
    {
      id: 2,
      thumbnail: '/content-thumb-2.jpg',
      title: 'Midnight Streets — Neon City D...',
      creator: 'velo user',
      uploadDate: '2025-10-12',
      status: 'Approved',
      statusColor: 'bg-green-100 text-green-700',
      views: '24,589',
    },
    {
      id: 3,
      thumbnail: '/content-thumb-3.jpg',
      title: 'Deep Space Talks — Episode 42',
      creator: 'velo user',
      uploadDate: '2025-10-01',
      status: 'Flagged',
      statusColor: 'bg-red-100 text-red-700',
      views: '1,204',
    },
    {
      id: 4,
      thumbnail: '/content-thumb-4.jpg',
      title: 'Arena Finals Live — Champions...',
      creator: 'velo user',
      uploadDate: '2025-09-24',
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-700',
      views: '56,900',
    },
  ];

  const contentTabs = ['All', 'Approved', 'Pending', 'Flagged'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} onLogout={() => setShowLogoutModal(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 ml-12 lg:ml-0">Content Management</h1>
            <div className="hidden lg:flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search content by title or creator name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-96"
                />
              </div>
              {/* Filter Icon */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex items-center gap-8">
              {contentTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setContentTab(tab)}
                  className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                    contentTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="hidden lg:flex items-center gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs sm:text-sm"
            >
              <option>Type: All</option>
              <option>Video</option>
              <option>Image</option>
              <option>Document</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs sm:text-sm"
            >
              <option>Sort by: Most Recent</option>
              <option>Sort by: Oldest</option>
              <option>Sort by: Most Views</option>
              <option>Sort by: Least Views</option>
            </select>
          </div>
        </header>

        {/* Content Table */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Thumbnail</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Title</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Creator</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Upload Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Views</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {contentItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="w-20 h-12 bg-gradient-to-br from-orange-400 to-pink-600 rounded-lg"></div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.title}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{item.creator}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{item.uploadDate}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{item.views}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </button>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing 1-12 of 87 uploads</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                  &lt;
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                  1
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                  2
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                  3
                </button>
                <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                  ...
                </button>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                  Next
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
