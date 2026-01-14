'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function ReportedContentDetailPage() {
  const router = useRouter();
  const [activeTab] = useState('reported-content');
  const [status, setStatus] = useState('Pending');
  const [internalNote, setInternalNote] = useState('');


  const auditLog = [
    { date: 'Oct 23', action: 'Report Received', by: 'System', notes: 'Auto-flagged via user report' },
    { date: 'Oct 23', action: 'Review Started', by: 'Admin Michael', notes: 'Reviewing content' },
    { date: 'Oct 24', action: 'Warning Sent', by: 'Admin Joseph', notes: 'Sent copyright notice' },
  ];


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-2 gap-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reported Content Detail</h1>
              <p className="text-sm text-gray-500">Home / Moderation / Reported Content</p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resolve Report
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Report Info Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 lg:mb-8">
            <div className="grid grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Report ID</p>
                <p className="text-base font-semibold text-gray-900">RPT-1023</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reported By</p>
                <p className="text-base font-semibold text-gray-900">@velo_user</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reported On</p>
                <p className="text-base font-semibold text-gray-900">Oct 23, 2025, 9:40 PM</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reason</p>
                <p className="text-base font-semibold text-gray-900">Inappropriate content / copyright issue</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pending Review
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Content Preview */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Content Preview</h2>
                  <span className="text-sm text-gray-500">ID: VID-88921</span>
                </div>

                {/* Video Preview */}
                <div className="mb-6 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Thumbnail / Video snapshot placeholder</p>
                </div>

                {/* Content Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">Exclusive Behind the Scenes – John&apos;s Studio Tour</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span>Creator: <span className="font-semibold text-gray-900">@johncreates</span></span>
                  <span>•</span>
                  <span>Upload Date: Oct 20, 2025</span>
                  <span>•</span>
                  <span>Views: 2.4 K</span>
                </div>

                <div className="flex items-center gap-4">
                  <button className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Full Content
                  </button>
                  <button className="px-6 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    View Creator Profile
                  </button>
                </div>
              </div>

              {/* Report Details & Reporter Comment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Report Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Report Details</h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="text-base text-gray-900">Inappropriate / Sensitive Material</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Violation Type</p>
                      <p className="text-base text-gray-900">Copyright Breach</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Submitted From</p>
                      <p className="text-base text-gray-900">Buyer Page (View Screen)</p>
                    </div>
                  </div>
                </div>

                {/* Reporter Comment */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Reporter Comment</h2>

                  <div>
                    <p className="text-sm text-gray-600 mb-3">What the reporter shared</p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-900 italic">&quot;This video contains unauthorized use of my song. Please review.&quot;</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Audit Trail / Activity Log</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">By</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map((log, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">{log.date}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{log.action}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{log.by}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{log.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Admin Action Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Admin Action Panel</h2>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pending
                  </span>
                </div>

                {/* Change Status */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option>Pending</option>
                    <option>Under Review</option>
                    <option>Resolved</option>
                    <option>Dismissed</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Actions</label>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 border-2 border-red-600 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Content
                    </button>
                    <button className="w-full px-4 py-3 border-2 border-yellow-600 text-yellow-600 bg-white rounded-lg hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Warn Creator
                    </button>
                    <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Resolved
                    </button>
                  </div>
                </div>

                {/* Add Internal Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Internal Note</label>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Write a note for other admins..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm"
                  />
                  <button className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
