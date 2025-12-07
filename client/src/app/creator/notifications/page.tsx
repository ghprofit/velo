'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notificationsApi } from '@/lib/api-client';

export default function NotificationsPage() {
  const [filterTab, setFilterTab] = useState('All');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterTabs = ['All', 'Earnings', 'Uploads', 'Platform Updates', 'Warnings / Policy', 'Support'];

  // Fetch notifications based on filter
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const category = filterTab === 'All' ? undefined : filterTab;
        const response = await notificationsApi.getNotifications(category);
        setNotifications(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError(err.response?.data?.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [filterTab]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await notificationsApi.getStats();
        setStats(response.data.data);
      } catch (err: any) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      // Refresh stats
      const response = await notificationsApi.getStats();
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // Refresh stats
      const response = await notificationsApi.getStats();
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Refresh stats
      const response = await notificationsApi.getStats();
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAllRead = async () => {
    try {
      await notificationsApi.clearAllRead();
      // Remove read notifications from local state
      setNotifications(prev => prev.filter(n => !n.isRead));
      // Refresh stats
      const response = await notificationsApi.getStats();
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Error clearing read notifications:', err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'PAYOUT_SENT':
      case 'PURCHASE_MADE':
        return {
          icon: 'earning',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        };
      case 'CONTENT_APPROVED':
      case 'CONTENT_REJECTED':
      case 'UPLOAD_SUCCESSFUL':
        return {
          icon: 'video',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      case 'PLATFORM_UPDATE':
      case 'NEW_FEATURE':
        return {
          icon: 'bell',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
        };
      case 'CONTENT_FLAGGED':
      case 'POLICY_WARNING':
        return {
          icon: 'warning',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
        };
      case 'SUPPORT_TICKET_RESOLVED':
      case 'SUPPORT_REPLY':
        return {
          icon: 'support',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      default:
        return {
          icon: 'bell',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
        };
    }
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
    <>
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
                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading notifications...
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No notifications to display</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const style = getNotificationStyle(notification.type);
                    return (
                      <div
                        key={notification.id}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                        className={`bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow ${!notification.isRead ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center flex-shrink-0 ${style.iconColor}`}>
                            {renderNotificationIcon(style.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                )}
                                <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
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
                <p className="text-4xl font-bold text-gray-900 mb-2">{stats?.unreadCount || 0}</p>
                <p className="text-sm text-gray-600">{stats?.recentUnread || 0} new since yesterday</p>
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
                <p className="text-4xl font-bold text-gray-900 mb-2">{stats?.reportsAwaiting || 0}</p>
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
                <p className="text-4xl font-bold text-gray-900 mb-2">{stats?.paymentAlerts || 0}</p>
                <p className="text-sm text-gray-600">Payout notifications</p>
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
                <p className="text-4xl font-bold text-gray-900 mb-2">{stats?.systemUpdates || 0}</p>
                <p className="text-sm text-gray-600">New features available</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/creator/earnings"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">View All Earnings</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/creator/upload"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">Upload New Content</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/creator/support"
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
    </>
  );
}
