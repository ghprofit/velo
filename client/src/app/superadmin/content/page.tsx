'use client';

import { useState } from 'react';

// Mock flagged content data
const mockFlaggedContent = [
  {
    id: '1',
    contentId: 'CNT-892374',
    creatorUsername: '@creator_username',
    previewType: 'video',
    reports: 47,
    severity: 'HIGH',
    status: 'Flagged',
    dateFlagged: 'Dec 8, 2024',
    time: '2:34 PM',
    assignedTo: null,
  },
  {
    id: '2',
    contentId: 'CNT-892301',
    creatorUsername: '@another_user',
    previewType: 'text',
    reports: 12,
    severity: 'MEDIUM',
    status: 'Pending Review',
    dateFlagged: 'Dec 8, 2024',
    time: '1:15 PM',
    assignedTo: { name: 'Alex Smith', avatar: 'AS' },
  },
  {
    id: '3',
    contentId: 'CNT-892289',
    creatorUsername: '@content_maker',
    previewType: 'image',
    reports: 3,
    severity: 'LOW',
    status: 'Pending Review',
    dateFlagged: 'Dec 7, 2024',
    time: '11:42 AM',
    assignedTo: null,
  },
  {
    id: '4',
    contentId: 'CNT-892267',
    creatorUsername: '@video_creator',
    previewType: 'video',
    reportType: 'Copyright',
    severity: 'MEDIUM',
    status: 'Pending Review',
    dateFlagged: 'Dec 7, 2024',
    time: '9:20 AM',
    assignedTo: { name: 'Mike Johnson', avatar: 'MJ' },
  },
];

export default function ContentOversightPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [queueType, setQueueType] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [contentType, setContentType] = useState('all');
  const [timePeriod, setTimePeriod] = useState('24h');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedTo, setAssignedTo] = useState('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-400 text-gray-900';
      case 'LOW':
        return 'bg-gray-700 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Flagged':
        return 'bg-red-100 text-red-600 border border-red-300';
      case 'Pending Review':
        return 'bg-orange-100 text-orange-600 border border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  return (
    <div className="p-8 bg-gray-50">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Global Content Oversight & Moderation</h1>
              <p className="text-gray-500 mt-1">Review and manage flagged content across the platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report
              </button>
              <button className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Advanced Filters
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Flagged Content (24H) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Flagged Content (24H)</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">247</p>
              <p className="text-sm text-red-500">↑12% vs yesterday</p>
            </div>

            {/* Pending Approval */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Pending Approval</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">1,834</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm text-orange-500">Requires attention</span>
              </div>
            </div>

            {/* Content Removed (L30D) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Content Removed (L30D)</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">3,492</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-600">Successfully moderated</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Content</label>
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
                    placeholder="Search by Creator, Content ID, or Keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Queue Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Queue Type</label>
                <div className="relative">
                  <select
                    value={queueType}
                    onChange={(e) => setQueueType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Queues</option>
                    <option value="automated">Automated</option>
                    <option value="user-reported">User Reported</option>
                    <option value="manual">Manual Review</option>
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

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <div className="relative">
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
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

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <div className="relative">
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="text">Text</option>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Time Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <div className="relative">
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="flagged">Flagged</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="removed">Removed</option>
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

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <div className="relative">
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Admins</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="me">Assigned to Me</option>
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

              {/* Action Buttons */}
              <div className="flex items-end gap-3">
                <button className="flex-1 px-6 py-3 bg-orange-400 text-white rounded-lg font-semibold hover:bg-orange-500 transition-colors">
                  Apply Filters
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Preview</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Creator</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Reports/Severity</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Date Flagged</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFlaggedContent.map((content) => (
                    <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="w-20 h-14 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                          {content.previewType === 'video' && (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          )}
                          {content.previewType === 'image' && (
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {content.previewType === 'text' && (
                            <div className="text-xs text-white px-2 text-center">
                              <p>Text</p>
                              <p>Content</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-blue-600">{content.creatorUsername}</div>
                          <div className="text-sm text-gray-500">ID: {content.contentId}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {content.reports ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium border border-red-300">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {content.reports} Reports
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium border border-green-300">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {content.reportType}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(content.severity)}`}>
                            {content.severity}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                          {content.status === 'Flagged' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 6v10a1 1 0 001 1h3V5H4a1 1 0 00-1 1zm15 0v9a1 1 0 01-1 1h-3V5h3a1 1 0 011 1zm-9 12h2V3H9v15z" />
                            </svg>
                          )}
                          {content.status === 'Pending Review' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {content.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="text-gray-900 font-medium">{content.dateFlagged}</div>
                        <div className="text-sm text-gray-500">{content.time}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {content.assignedTo ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {content.assignedTo.avatar}
                            </div>
                            <span className="text-gray-900">{content.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
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
