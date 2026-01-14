'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function ContentReviewPage() {
  const [activeTab] = useState('content-review');
  const [reviewComments, setReviewComments] = useState('');

  const reportedIssues = [
    {
      id: '#4521',
      type: 'Copyright',
      description: 'Similar to another video',
      date: 'Oct 19, 2025',
      reporter: 'User 1221',
      status: 'Open',
      statusColor: 'bg-yellow-100 text-yellow-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-2 gap-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Content Review</h1>
              <p className="text-sm text-gray-500">Home / Content / Content Review</p>
            </div>
            <Link
              href="/admin/content"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Content
            </Link>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <p className="text-gray-600">Review and moderate content before publishing.</p>
            <button className="hidden lg:flex px-4 py-2 text-gray-700 hover:bg-white border border-gray-300 rounded-lg transition-colors items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Content Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Content Preview</h2>

                {/* Video Preview */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                  <div className="absolute inset-0 flex items-center justify-center" style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 35px,
                      rgba(255,255,255,.05) 35px,
                      rgba(255,255,255,.05) 70px
                    )`,
                    backgroundColor: '#1f2937'
                  }}>
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center overflow-hidden opacity-30">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <span key={i} className="text-white font-semibold text-xl px-4 py-2">VeloLink</span>
                      ))}
                    </div>
                  </div>

                  {/* Control Icons */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* File Info Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">File</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Size</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">travel_diary.mov</td>
                        <td className="py-3 px-4 text-sm text-gray-900">02:15</td>
                        <td className="py-3 px-4 text-sm text-gray-900">180MB</td>
                        <td className="py-3 px-4 text-sm text-gray-900">Oct 21, 2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Content Metadata */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Content Metadata</h2>

                {/* Creator Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Name</p>
                      <p className="text-sm font-medium text-gray-900">Velo_User</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Username</p>
                      <p className="text-sm font-medium text-gray-900">@velocreates</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900">velouser@gmail.com</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Uploads</p>
                      <p className="text-sm font-medium text-gray-900">34</p>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Title</p>
                      <p className="text-sm font-medium text-gray-900">&quot;A Day in Paris&quot;</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Category</p>
                      <p className="text-sm font-medium text-gray-900">Travel Vlog</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Paris</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Lifestyle</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Vlog</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Visibility</p>
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending Approval
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Copyright Declaration</p>
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Provided</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Monetization Option</p>
                      <p className="text-sm font-medium text-gray-900">$10 Unlock Price</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Review Comments Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mt-6 lg:mt-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Add Review Comments (optional)</h2>
            <textarea
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="Write your feedback for this content..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-gray-700"
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6">
              <button className="px-4 sm:px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Approve Content
              </button>

              <button className="px-4 sm:px-6 py-3 border-2 border-red-600 text-red-600 bg-white rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reject Content
              </button>

              <button className="px-4 sm:px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Request Edits
              </button>
            </div>
          </div>

          {/* Reported Issues Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mt-6 lg:mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Reported Issues</h2>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Report ID</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Reporter</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedIssues.map((issue) => (
                    <tr key={issue.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{issue.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{issue.type}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{issue.description}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{issue.date}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{issue.reporter}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${issue.statusColor}`}>
                          {issue.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
