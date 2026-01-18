'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import TicketDetailModal from '@/components/TicketDetailModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  useGetSupportStatsQuery,
  useGetSupportTicketsQuery,
  useUpdateTicketStatusMutation,
} from '@/state/api';
import { exportToCSV } from '@/utils/export-utils';

export default function SupportReportsPage() {
  const router = useRouter();
  const [activeTab] = useState('support-reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [issueType, setIssueType] = useState('All Types');
  const [status, setStatus] = useState('All Status');
  const [priority, setPriority] = useState('All Priorities');
  const [assignedTo, setAssignedTo] = useState('All Admins');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);

  // Fetch stats and tickets data
  const { data: statsData, isLoading: statsLoading } = useGetSupportStatsQuery();

  const ticketQueryParams = useMemo(() => ({
    search: searchQuery || undefined,
    status: status !== 'All Status' ? status.toUpperCase().replace(' ', '_') : undefined,
    priority: priority !== 'All Priorities' ? priority.toUpperCase() : undefined,
    assignedTo: assignedTo !== 'All Admins' ? assignedTo : undefined,
    page: currentPage,
    limit: pageLimit,
  }), [searchQuery, status, priority, assignedTo, currentPage, pageLimit]);

  const { data: ticketsData, isLoading: ticketsLoading, refetch: refetchTickets } = useGetSupportTicketsQuery(ticketQueryParams);

  const [updateStatus] = useUpdateTicketStatusMutation();

  const stats = statsData?.data;
  const tickets = ticketsData?.data || [];
  const pagination = ticketsData?.pagination;

  // Sample data for ticket volume trend (keeping for now, can be enhanced later)
  const ticketVolumeData = [
    { day: 'Day 1', tickets: 12 },
    { day: 'Day 5', tickets: 18 },
    { day: 'Day 10', tickets: 14 },
    { day: 'Day 15', tickets: 22 },
    { day: 'Day 20', tickets: 16 },
    { day: 'Day 25', tickets: 28 },
    { day: 'Day 30', tickets: 24 },
  ];

  // Handler for status change
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateStatus({ id: ticketId, status: newStatus }).unwrap();
    } catch (error) {
      alert('Failed to update ticket status');
    }
  };

  // Handler for viewing ticket details
  const handleViewTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setShowTicketModal(true);
  };

  // Helper function for status colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'OPEN': 'bg-yellow-100 text-yellow-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'RESOLVED': 'bg-green-100 text-green-700',
      'CLOSED': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Handler for exporting tickets to CSV
  const handleExportReport = () => {
    const exportData = tickets.map((ticket) => ({
      'Ticket ID': ticket.id,
      'Email': ticket.email,
      'Subject': ticket.subject,
      'Status': ticket.status,
      'Priority': ticket.priority,
      'Created': new Date(ticket.createdAt).toLocaleDateString(),
      'Assigned To': ticket.assignedTo || 'Unassigned',
    }));
    exportToCSV(exportData, 'support-tickets');
  };


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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Support Reports & Ticket Management</h1>
              <p className="text-sm text-gray-600">Manage and resolve all incoming support tickets from creators</p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={handleExportReport}
                disabled={tickets.length === 0}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Report
              </button>
              <button
                onClick={() => alert('Create ticket form coming soon')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Ticket
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Tickets */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">ALL TIME</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {statsLoading ? 'Loading...' : stats?.totalTickets?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
              <p className="text-sm text-blue-600 font-medium">All time</p>
            </div>

            {/* Resolved */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">L30D</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {statsLoading ? 'Loading...' : stats?.resolvedTickets?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-sm text-green-600 font-medium">Successfully resolved</p>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">ACTIVE</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {statsLoading ? 'Loading...' : ((stats?.openTickets || 0) + (stats?.inProgressTickets || 0)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-sm text-yellow-600 font-medium">
                {statsLoading ? '...' : `${stats?.averageResponseTime?.toFixed(1) || '0'} hrs avg response time`}
              </p>
            </div>

            {/* Escalated / Urgent */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">URGENT</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {statsLoading ? 'Loading...' : stats?.urgentTickets?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600 mb-1">Escalated / Urgent</p>
              <p className="text-sm text-red-600 font-medium">Immediate attention required</p>
            </div>
          </div>

          {/* Ticket Volume Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Ticket Volume Trend (Last 30 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ticketVolumeData}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    label={{ value: 'Tickets', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Tickets']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tickets"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTickets)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Ticket ID, User Name, or Keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option>All Types</option>
                  <option>Payout Issue</option>
                  <option>Technical Bug</option>
                  <option>Content Report</option>
                  <option>Account Access</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option>All Priorities</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option>All Admins</option>
                  <option>Sarah Mitchell</option>
                  <option>John Davis</option>
                  <option>Emily Chen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Support Tickets Queue */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Support Tickets Queue</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {pagination ? `Showing ${pagination.total} tickets` : 'Loading...'}
                </span>
                <button
                  onClick={() => refetchTickets()}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Ticket ID</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User Name</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Issue Summary</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Issue Type</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date Submitted</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Assigned To</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-600">
                        Loading tickets...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-600">
                        No tickets found
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">#{ticket.id.slice(0, 8)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {ticket.email?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm text-gray-900">{ticket.email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">{ticket.subject}</td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700">
                            Support Request
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)} border-none outline-none cursor-pointer`}
                          >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {ticket.assignedTo || 'Unassigned'}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleViewTicket(ticket.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicketId(null);
          }}
        />
      )}
    </div>
  );
}
