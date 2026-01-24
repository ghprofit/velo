'use client';

import { JSX, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';
import {
  useGetUserNotificationsQuery,
  useGetUserNotificationStatsQuery,
  useMarkUserNotificationAsReadMutation,
  useMarkAllUserNotificationsAsReadMutation,
  useClearAllReadNotificationsMutation,
  useDeleteUserNotificationMutation,
} from '@/state/api';

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  const [filterTab, setFilterTab] = useState('All');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch notifications and stats
  const { data: notificationsData, isLoading: notificationsLoading } = useGetUserNotificationsQuery({
    category: filterTab === 'All' ? undefined : filterTab,
  });
  const { data: statsData, isLoading: statsLoading } = useGetUserNotificationStatsQuery();

  // Mutations
  const [markAsRead] = useMarkUserNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllUserNotificationsAsReadMutation();
  const [clearAllRead] = useClearAllReadNotificationsMutation();
  const [deleteNotification] = useDeleteUserNotificationMutation();

  const stats = statsData?.data;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'upload', label: 'Upload Content', icon: 'upload', href: '/dashboard/upload' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', href: '/dashboard/analytics' },
    { id: 'earnings', label: 'Earnings', icon: 'earnings', href: '/dashboard/earnings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', href: '/dashboard/notifications' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/dashboard/settings' },
    { id: 'support', label: 'Support', icon: 'support', href: '/dashboard/support' },
  ];

  const filterTabs = ['All', 'Earnings', 'Uploads', 'Platform Updates', 'Warnings / Policy', 'Support'];

  // Map notification types to categories
  const getCategoryFromType = (type: string): string => {
    const typeMap: Record<string, string> = {
      PURCHASE_MADE: 'Earnings',
      PAYOUT_SENT: 'Earnings',
      PAYOUT_FAILED: 'Earnings',
      CONTENT_APPROVED: 'Uploads',
      CONTENT_REJECTED: 'Uploads',
      UPLOAD_SUCCESSFUL: 'Uploads',
      CONTENT_UNDER_REVIEW: 'Uploads',
      PLATFORM_UPDATE: 'Platform Updates',
      NEW_FEATURE: 'Platform Updates',
      SYSTEM_MAINTENANCE: 'Platform Updates',
      ANNOUNCEMENT: 'Platform Updates',
      CONTENT_FLAGGED: 'Warnings / Policy',
      POLICY_WARNING: 'Warnings / Policy',
      POLICY_UPDATE: 'Warnings / Policy',
      SUPPORT_TICKET_CREATED: 'Support',
      SUPPORT_TICKET_RESOLVED: 'Support',
      SUPPORT_REPLY: 'Support',
    };
    return typeMap[type] || 'Platform Updates';
  };

  // Filter notifications by category
  const filteredNotifications = useMemo(() => {
    const notifications = notificationsData?.data || [];
    if (filterTab === 'All') return notifications;
    return notifications.filter(n => getCategoryFromType(n.type) === filterTab);
  }, [notificationsData?.data, filterTab]);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Handle clear all read
  const handleClearAllRead = async () => {
    try {
      await clearAllRead().unwrap();
    } catch (error) {
      console.error('Failed to clear all read:', error);
    }
  };

  // Handle notification click (mark as read)
  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(notificationId).unwrap();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(notificationId).unwrap();
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

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

  const renderNotificationIcon = (type: string) => {
    const isEarning = ['PURCHASE_MADE', 'PAYOUT_SENT', 'PAYOUT_FAILED'].includes(type);
    const isUpload = ['CONTENT_APPROVED', 'CONTENT_REJECTED', 'UPLOAD_SUCCESSFUL', 'CONTENT_UNDER_REVIEW'].includes(type);
    const isWarning = ['CONTENT_FLAGGED', 'POLICY_WARNING'].includes(type);
    const isSupport = ['SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_RESOLVED', 'SUPPORT_REPLY'].includes(type);

    if (isEarning) {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold">$</text>
        </svg>
      );
    }
    if (isUpload) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (isWarning) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    if (isSupport) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    // Default bell icon
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  };

  const getIconColor = (type: string): { iconBg: string; iconColor: string } => {
    if (['PURCHASE_MADE', 'PAYOUT_SENT'].includes(type)) {
      return { iconBg: 'bg-green-100', iconColor: 'text-green-600' };
    }
    if (['CONTENT_APPROVED', 'UPLOAD_SUCCESSFUL'].includes(type)) {
      return { iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
    }
    if (['CONTENT_FLAGGED', 'POLICY_WARNING', 'PAYOUT_FAILED'].includes(type)) {
      return { iconBg: 'bg-orange-100', iconColor: 'text-orange-600' };
    }
    if (['SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_RESOLVED', 'SUPPORT_REPLY'].includes(type)) {
      return { iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
    }
    return { iconBg: 'bg-purple-100', iconColor: 'text-purple-600' };
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
                  <button
                    onClick={handleClearAllRead}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Read
                  </button>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
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
                {notificationsLoading ? (
                  <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                    <p className="text-gray-600">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-600">No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const { iconBg, iconColor } = getIconColor(notification.type);
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                        className={`bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                          !notification.isRead ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                            {renderNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                )}
                                <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">{notification.title}</h3>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {statsLoading ? '...' : stats?.unreadCount || 0}
                </p>
                <p className="text-sm text-gray-600">
                  {statsLoading ? '...' : stats?.recentUnread || 0} new since yesterday
                </p>
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
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {statsLoading ? '...' : stats?.reportsAwaiting || 0}
                </p>
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
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {statsLoading ? '...' : stats?.paymentAlerts || 0}
                </p>
                <p className="text-sm text-gray-600">Payment notifications</p>
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
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {statsLoading ? '...' : stats?.systemUpdates || 0}
                </p>
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
