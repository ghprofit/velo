'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  const [filterTab, setFilterTab] = useState('All');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'upload', label: 'Upload Content', icon: 'upload', href: '/dashboard/upload' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', href: '/dashboard/analytics' },
    { id: 'earnings', label: 'Earnings', icon: 'earnings', href: '/dashboard/earnings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', href: '/dashboard/notifications' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/dashboard/settings' },
    { id: 'support', label: 'Support', icon: 'support', href: '/dashboard/support' },
  ];

  const notifications = [
    {
      id: 1,
      time: '2 hours ago',
      icon: 'earning',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'New Earning: $247.50',
      description: 'Your video "Advanced React Patterns" generated new revenue from premium subscriptions.',
      unread: true,
      category: 'Earnings',
    },
    {
      id: 2,
      time: '5 hours ago',
      icon: 'video',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Upload Successful',
      description: 'Your video "TypeScript Best Practices 2024" has been published and is now live.',
      unread: true,
      category: 'Uploads',
    },
    {
      id: 3,
      time: 'Yesterday',
      icon: 'bell',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Platform Update: New Analytics Dashboard',
      description: "We've launched an enhanced analytics dashboard with real-time metrics and advanced filtering options.",
      unread: true,
      category: 'Platform Updates',
    },
    {
      id: 4,
      time: 'Yesterday',
      icon: 'earning',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Monthly Payout Processed: $3,421.75',
      description: 'Your earnings for December have been processed and will arrive in 2-3 business days.',
      unread: true,
      category: 'Earnings',
    },
    {
      id: 5,
      time: '2 days ago',
      icon: 'warning',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Content Review Required',
      description: 'Your video "Controversial Tech Takes" has been flagged for review. Please check community guidelines.',
      unread: true,
      category: 'Warnings / Policy',
    },
    {
      id: 6,
      time: '3 days ago',
      icon: 'support',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Support Ticket Resolved',
      description: 'Your support ticket #4521 regarding payment issues has been resolved. Check your email for details.',
      unread: true,
      category: 'Support',
    },
    {
      id: 7,
      time: '4 days ago',
      icon: 'milestone',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Milestone Reached: 10K Subscribers!',
      description: "Congratulations! You've reached 10,000 subscribers. Keep creating amazing content!",
      unread: true,
      category: 'Platform Updates',
    },
  ];

  const filterTabs = ['All', 'Earnings', 'Uploads', 'Platform Updates', 'Warnings / Policy', 'Support'];

  const filteredNotifications = filterTab === 'All'
    ? notifications
    : notifications.filter(n => n.category === filterTab);

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const icons: Record<string, JSX.Element> = {
      dashboard: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      upload: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      analytics: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      earnings: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      notifications: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      settings: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      support: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      logout: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  const renderNotificationIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      earning: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold">$</text>
        </svg>
      ),
      video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      bell: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      warning: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      support: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      milestone: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="14" width="16" height="12" rx="2" fill="black"/>
              <path d="M11 14V10C11 7.23858 13.2386 5 16 5C18.7614 5 21 7.23858 21 10V14" stroke="black" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="20" r="1.5" fill="white"/>
            </svg>
            <div className="border-l-2 border-gray-900 pl-3">
              <div className="text-xl">
                <span className="font-bold text-gray-900">Velo</span>
                <span className="font-light text-gray-900">Link</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full"
            onClick={() => setShowLogoutModal(true)}
          >
            {renderIcon('logout')}
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex gap-8">
            {/* Left Column - Notifications List */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications Center</h1>
                  <p className="text-gray-600">Stay updated on your earnings, uploads, and platform alerts.</p>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Read
                  </button>
                  <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark All as Read
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex items-center gap-6 overflow-x-auto">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        filterTab === tab
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${notification.iconBg} rounded-full flex items-center justify-center flex-shrink-0 ${notification.iconColor}`}>
                        {renderNotificationIcon(notification.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            {notification.unread && (
                              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                          <button className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar - Summary Stats */}
            <div className="w-80 space-y-6">
              {/* Unread Notifications */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Unread Notifications</h3>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">12</p>
                <p className="text-sm text-gray-600">4 new since yesterday</p>
              </div>

              {/* Reports Awaiting Action */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Reports Awaiting Action</h3>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">2</p>
                <p className="text-sm text-gray-600">Requires your response</p>
              </div>

              {/* Payment Alerts */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Payment Alerts</h3>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">$</text>
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">1</p>
                <p className="text-sm text-gray-600">Payout processed</p>
              </div>

              {/* System Updates */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">System Updates</h3>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">3</p>
                <p className="text-sm text-gray-600">New features available</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/earnings"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">View All Earnings</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/dashboard/upload"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Upload New Content</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/dashboard/support"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Contact Support</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
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
