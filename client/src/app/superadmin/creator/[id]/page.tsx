'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock data for the creator
const mockCreatorData = {
  id: 'CR-001847',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  dob: 'March 15, 1995',
  status: 'Active',
  kycStatus: 'Verified',
  twoFactorEnabled: true,
  lastLoginIP: '192.168.1.100',
  location: 'New York, US',
  accountCreated: 'Jan 15, 2024',
  lastActivity: '2 hours ago',
  profileCompletion: 100,
  lifetimeEarnings: 45230,
  totalPayouts: 38940,
  pendingBalance: 6290,
  payoutMethod: 'Stripe Connect',
  payoutVerified: true,
  totalContent: 247,
  contentFlagged: 3,
  moderationWarnings: 1,
};

const mockModerationEvents = [
  {
    id: '1',
    date: 'Nov 5, 2024',
    action: 'Content Removed',
    reason: 'Copyright violation',
    admin: 'Sarah Wilson',
  },
  {
    id: '2',
    date: 'Oct 28, 2024',
    action: 'Warning Issued',
    reason: 'Community guidelines',
    admin: 'Mike Chen',
  },
];

const mockAuditLog = [
  {
    id: '1',
    title: 'Account Created',
    description: 'Creator account was successfully created and activated',
    timestamp: 'Jan 15, 2024 at 10:30 AM',
    by: 'System',
    icon: 'user-add',
  },
  {
    id: '2',
    title: 'KYC Verification Completed',
    description: 'Identity documents verified and approved',
    timestamp: 'Jan 18, 2024 at 2:15 PM',
    by: 'Admin Team',
    icon: 'document',
  },
  {
    id: '3',
    title: 'First Payout Processed',
    description: '$1,250.00 sent to Stripe Connect account',
    timestamp: 'Feb 1, 2024 at 9:00 AM',
    by: 'Payment System',
    icon: 'payment',
  },
  {
    id: '4',
    title: 'Content Moderation Action',
    description: 'Warning issued for community guidelines violation',
    timestamp: 'Oct 28, 2024 at 3:45 PM',
    by: 'Mike Chen',
    icon: 'warning',
  },
];

export default function CreatorAuditPage() {
  const params = useParams();
  const creator = mockCreatorData;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Content Removed':
        return 'bg-red-100 text-red-600 border border-red-300';
      case 'Warning Issued':
        return 'bg-orange-100 text-orange-600 border border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getAuditIcon = (iconType: string) => {
    switch (iconType) {
      case 'user-add':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'document':
        return (
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/superadmin/creators"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Audit: {creator.name}</h1>
              <p className="text-gray-500">Complete creator profile and action center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white text-green-600 rounded-full text-sm font-medium border border-green-300">
              {creator.status}
            </span>
            <span className="px-4 py-2 bg-white text-green-600 rounded-full text-sm font-medium border border-green-300">
              KYC {creator.kycStatus}
            </span>
            <button className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspend Account
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Ban Permanently
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-white text-red-600 rounded-lg font-semibold border border-red-300 hover:bg-red-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Override KYC
            </button>
          </div>
        </div>
      </div>

      {/* Profile, Contact & Verification */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Profile, Contact & Verification</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View KYC Documents
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: User Info */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {creator.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{creator.name}</h3>
              <p className="text-gray-500">{creator.email}</p>
              <p className="text-gray-500">DOB: {creator.dob}</p>
            </div>
          </div>

          {/* Middle: Security Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">2FA Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Login IP</span>
              <span className="text-gray-900">{creator.lastLoginIP}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Location</span>
              <span className="text-gray-900">{creator.location}</span>
            </div>
          </div>

          {/* Right: Account Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Account Created</span>
              <span className="text-gray-900">{creator.accountCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Activity</span>
              <span className="text-gray-900">{creator.lastActivity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Profile Completion</span>
              <span className="text-green-600 font-medium">{creator.profileCompletion}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Financial Overview</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Full History
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Lifetime Earnings */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lifetime Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${creator.lifetimeEarnings.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Total Payouts */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
              <p className="text-2xl font-bold text-gray-900">${creator.totalPayouts.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          {/* Pending Balance */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Balance</p>
              <p className="text-2xl font-bold text-gray-900">${creator.pendingBalance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Payout Method */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payout Method</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-indigo-600">stripe</span>
                <span className="text-gray-900 font-medium">{creator.payoutMethod}</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content & Moderation History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Content & Moderation History</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Review Content Library
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center py-6 border border-gray-200 rounded-lg">
            <p className="text-4xl font-bold text-gray-900 mb-2">{creator.totalContent}</p>
            <p className="text-sm text-gray-600">Total Content Uploaded</p>
          </div>
          <div className="text-center py-6 border border-gray-200 rounded-lg">
            <p className="text-4xl font-bold text-red-500 mb-2">{creator.contentFlagged}</p>
            <p className="text-sm text-gray-600">Content Flagged</p>
          </div>
          <div className="text-center py-6 border border-gray-200 rounded-lg">
            <p className="text-4xl font-bold text-orange-500 mb-2">{creator.moderationWarnings}</p>
            <p className="text-sm text-gray-600">Moderation Warnings</p>
          </div>
        </div>

        {/* Recent Moderation Events */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Moderation Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Action</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Reason</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Admin</th>
                </tr>
              </thead>
              <tbody>
                {mockModerationEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-center text-gray-600">{event.date}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionColor(event.action)}`}>
                        {event.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{event.reason}</td>
                    <td className="py-4 px-4 text-center text-gray-900 font-medium">{event.admin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Audit Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">System Audit Log (Internal Actions)</h2>
          <span className="flex items-center gap-2 px-3 py-1 bg-white text-red-600 rounded-full text-sm font-medium border border-red-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Super Admin Only
          </span>
        </div>

        <div className="space-y-6">
          {mockAuditLog.map((log) => (
            <div key={log.id} className="flex items-start gap-4">
              {getAuditIcon(log.icon)}
              <div>
                <h4 className="font-semibold text-gray-900">{log.title}</h4>
                <p className="text-gray-600 text-sm">{log.description}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {log.timestamp} <span className="text-gray-400">by</span> {log.by}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
