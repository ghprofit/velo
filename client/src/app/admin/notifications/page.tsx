'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';
import AdminSidebar from '@/components/AdminSidebar';

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest → Oldest');

  const categoryTabs = ['All', 'Payments', 'Reports', 'Content', 'System', 'Support'];
  const statusTabs = ['All', 'Unread', 'Read'];

  const notifications = [
    {
      id: 1,
      icon: 'wallet',
      title: 'New payout completed for Creator @linaart – $120 sent via Stripe.',
      description: 'Funds were successfully transferred. View payout details in Transactions.',
      time: '10:32 AM',
      date: 'Today — October 23, 2025',
      category: 'Payments',
      unread: true,
    },
    {
      id: 2,
      icon: 'flag',
      title: 'Reported Content #RPT-1023 awaiting review.',
      description: 'Buyer flagged "Behind The Scenes – Studio Tour" for potential copyright issue.',
      time: '9:50 AM',
      date: 'Today — October 23, 2025',
      category: 'Reports',
      unread: true,
    },
    {
      id: 3,
      icon: 'chart',
      title: 'System Update: "Analytics dashboard improved for faster load times."',
      description: 'Performance optimizations deployed to analytics queries and caching.',
      time: '7:12 PM',
      date: 'Yesterday — October 22, 2025',
      category: 'System',
      unread: false,
    },
    {
      id: 4,
      icon: 'chat',
      title: 'New support ticket from @userhelp.',
      description: 'Subject: Issue accessing purchased video link. Requires follow-up.',
      time: '6:03 PM',
      date: 'Yesterday — October 22, 2025',
      category: 'Support',
      unread: false,
    },
    {
      id: 5,
      icon: 'userPlus',
      title: 'New creator @linaart joined the platform.',
      description: 'Creator profile created and pending first content upload.',
      time: '2:20 PM',
      date: 'Yesterday — October 22, 2025',
      category: 'Content',
      unread: false,
    },
    {
      id: 6,
      icon: 'settings',
      title: 'System maintenance window completed.',
      description: 'All services operational after scheduled maintenance.',
      time: '11:05 AM',
      date: 'Earlier — October 20, 2025',
      category: 'System',
      unread: false,
    },
  ];


  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const icons: Record<string, JSX.Element> = {
      wallet: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      ),
      flag: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      chart: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      chat: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      userPlus: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      settings: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bell: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  const getNotificationIcon = (iconName: string) => {
    const iconMap: Record<string, string> = {
      wallet: 'wallet',
      flag: 'flag',
      chart: 'chart',
      chat: 'chat',
      userPlus: 'userPlus',
      settings: 'settings',
    };
    return iconMap[iconName] || 'bell';
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = notification.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const dateOrder = ['Today — October 23, 2025', 'Yesterday — October 22, 2025', 'Earlier — October 20, 2025'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onLogout={() => setShowLogoutModal(true)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications Center</h1>
                <p className="text-gray-600 mt-1">Home / Notifications</p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark All as Read
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Notifications
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Left Column - Notifications Feed */}
            <div className="lg:col-span-3">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
                {/* Category Tabs */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCategoryFilter(tab)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        categoryFilter === tab
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Status Tabs and Search */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {statusTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          statusFilter === tab
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
                      />
                    </div>

                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700"
                    >
                      <option>Newest → Oldest</option>
                      <option>Oldest → Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4 lg:space-y-6">
                {dateOrder.map((date) => {
                  const dateNotifications = groupedNotifications[date];
                  if (!dateNotifications) return null;

                  return (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-lg font-bold text-gray-900">{date}</h2>
                      </div>

                      {/* Notifications */}
                      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {dateNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-4"
                          >
                            {/* Icon */}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              {renderIcon(getNotificationIcon(notification.icon), 'w-6 h-6 text-gray-700')}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600">{notification.description}</p>
                            </div>

                            {/* Time and Unread Indicator */}
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm text-gray-500">{notification.time}</span>
                              {notification.unread && (
                                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-gray-600">Last synced: 2 mins ago</p>
                <Link href="/admin/notifications/logs" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View All Logs
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Sidebar - Summary Cards */}
            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-8">
                {/* Unread Notifications */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">+3</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Unread Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>

                {/* Reports Awaiting Action */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Reports Awaiting Action</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>

                {/* Payment Alerts */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Payment Alerts</p>
                  <p className="text-3xl font-bold text-gray-900">5</p>
                </div>

                {/* System Updates */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">System Updates</p>
                  <p className="text-3xl font-bold text-gray-900">4</p>
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
