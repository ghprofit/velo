'use client';

import { useState, useMemo } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  useGetNotificationStatsQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  NotificationData,
} from '@/state/api';

export default function NotificationsPage() {
  const [activeTab] = useState('notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);

  const categoryTabs = ['All', 'PAYMENT', 'REPORT', 'CONTENT', 'SYSTEM', 'SUPPORT'];
  const statusTabs = ['All', 'Unread', 'Read'];

  // Build query parameters
  const notificationQueryParams = useMemo(() => ({
    search: searchQuery || undefined,
    type: categoryFilter !== 'All' ? categoryFilter : undefined,
    isRead: statusFilter === 'Unread' ? false : statusFilter === 'Read' ? true : undefined,
    page: currentPage,
    limit: pageLimit,
  }), [searchQuery, categoryFilter, statusFilter, currentPage, pageLimit]);

  // Fetch data
  const { data: statsData, isLoading: statsLoading } = useGetNotificationStatsQuery();
  const { data: notificationsData, isLoading: notificationsLoading } = useGetNotificationsQuery(notificationQueryParams);

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const stats = statsData?.data;
  const notifications = notificationsData?.data || [];
  const pagination = notificationsData?.pagination;

  // Sort notifications
  const sortedNotifications = useMemo(() => {
    const sorted = [...notifications];
    if (sortOrder === 'oldest') {
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, sortOrder]);

  // Group notifications by date
  const groupNotificationsByDate = (notifications: NotificationData[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<string, NotificationData[]> = {
      'Today': [],
      'Yesterday': [],
      'Earlier': [],
    };

    notifications.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      if (notifDay.getTime() === today.getTime()) {
        groups['Today'].push(notification);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(notification);
      } else {
        groups['Earlier'].push(notification);
      }
    });

    return groups;
  };

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(sortedNotifications),
    [sortedNotifications]
  );

  // Handle mark as read
  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(notificationId).unwrap();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({}).unwrap();
    } catch (error) {
      alert('Failed to mark all notifications as read');
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this notification?')) {
      try {
        await deleteNotification(notificationId).unwrap();
      } catch (error) {
        alert('Failed to delete notification');
      }
    }
  };

  // Export to CSV function
  const exportToCSV = () => {
    if (notifications.length === 0) {
      alert('No notifications to export');
      return;
    }

    const headers = ['ID', 'Type', 'Title', 'Message', 'Status', 'User Email', 'Created At'];
    const csvData = notifications.map((notif) => [
      notif.id,
      notif.type,
      notif.title,
      notif.message,
      notif.isRead ? 'Read' : 'Unread',
      notif.user?.email || 'N/A',
      new Date(notif.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin-notifications-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Helper function to get icon for notification type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'REPORT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'CONTENT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'SYSTEM':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'SUPPORT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'bg-green-100 text-green-600';
      case 'REPORT':
        return 'bg-purple-100 text-purple-600';
      case 'CONTENT':
        return 'bg-orange-100 text-orange-600';
      case 'SYSTEM':
        return 'bg-blue-100 text-blue-600';
      case 'SUPPORT':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} />

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
                <button
                  onClick={exportToCSV}
                  disabled={notifications.length === 0}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark All as Read
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
                      />
                    </div>

                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700"
                    >
                      <option value="newest">Newest → Oldest</option>
                      <option value="oldest">Oldest → Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4 lg:space-y-6">
                {notificationsLoading ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-600">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-600">No notifications found</p>
                  </div>
                ) : (
                  Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
                    notifs.length > 0 && (
                      <div key={dateGroup}>
                        {/* Date Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h2 className="text-lg font-bold text-gray-900">{dateGroup}</h2>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                          {notifs.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                              className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-4 ${
                                !notification.isRead ? 'bg-indigo-50/30' : ''
                              }`}
                            >
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getIconColor(notification.type)}`}>
                                {getIconForType(notification.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                    {notification.type}
                                  </span>
                                  {notification.user && (
                                    <span>• {notification.user.email}</span>
                                  )}
                                </div>
                              </div>

                              {/* Unread Indicator and Actions */}
                              <div className="flex items-center gap-3 shrink-0">
                                {!notification.isRead && (
                                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                                )}
                                <button
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-700">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Unread Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? 'Loading...' : stats?.unread || 0}
                  </p>
                </div>

                {/* Total Notifications */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? 'Loading...' : stats?.total || 0}
                  </p>
                </div>

                {/* Payment Notifications */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Payment Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? 'Loading...' : stats?.byType?.['PAYMENT'] || 0}
                  </p>
                </div>

                {/* Report Notifications */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Report Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? 'Loading...' : stats?.byType?.['REPORT'] || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
