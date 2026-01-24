'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetAdminByIdQuery, useGetAdminActivityQuery, useUpdateAdminMutation, useForcePasswordResetMutation } from '@/state/api';

interface AdminActivity {
  id: string;
  createdAt: string;
  action: string;
  reason?: string;
  targetType: string;
  targetId: string;
}

export default function AdminAuditPage() {
  const params = useParams();
  const adminId = params?.id as string;
  
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Mutations
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [forcePasswordReset, { isLoading: isResettingPassword }] = useForcePasswordResetMutation();

  // Fetch admin data
  const { data: adminResponse, isLoading: isLoadingAdmin, error: adminError } = useGetAdminByIdQuery(adminId || '', {
    skip: !adminId,
  });

  // Fetch admin activity
  const { data: activityResponse, isLoading: isLoadingActivity } = useGetAdminActivityQuery(adminId || '', {
    skip: !adminId,
  });

  const activitiesPerPage = 6;
  const activityLog = (activityResponse?.data || []) as AdminActivity[];
  const totalActivities = activityLog.length;
  const totalPages = Math.ceil(totalActivities / activitiesPerPage);

  // Handle loading state
  if (isLoadingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (adminError || !adminResponse?.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Not Found</h2>
          <p className="text-gray-600 mb-4">The admin account you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/superadmin/management"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Admin Management
          </Link>
        </div>
      </div>
    );
  }

  const admin = adminResponse.data;

  // Map permissions to display format
  const permissionsList = [
    { name: 'Access Dashboard', enabled: admin.permissions.dashboard },
    { name: 'Creator Management', enabled: admin.permissions.creatorManagement },
    { name: 'Content Review', enabled: admin.permissions.contentReview },
    { name: 'Financial Reports', enabled: admin.permissions.financialReports },
    { name: 'System Settings', enabled: admin.permissions.systemSettings },
    { name: 'Support Tickets', enabled: admin.permissions.supportTickets },
  ];

  const handleEditAdmin = async () => {
    if (!editRole && !editStatus) return;

    try {
      await updateAdmin({
        id: adminId,
        data: {
          ...(editRole && { role: editRole as any }),
          ...(editStatus && { status: editStatus as any }),
        },
      }).unwrap();
      setShowEditModal(false);
      setEditRole('');
      setEditStatus('');
      setMessageModalContent({
        title: 'Success',
        message: 'Admin details updated successfully.',
        type: 'success',
      });
      setShowMessageModal(true);
    } catch (error) {
      console.error('Failed to update admin:', error);
      setMessageModalContent({
        title: 'Error',
        message: 'Failed to update admin. Please try again.',
        type: 'error',
      });
      setShowMessageModal(true);
    }
  };

  const openEditModal = () => {
    setEditRole(admin.role);
    setEditStatus(admin.status);
    setShowEditModal(true);
  };

  const handleForce2FAResetClick = async () => {
    if (!confirm('Are you sure you want to reset 2FA for this admin? They will need to set it up again.')) {
      return;
    }

    try {
      await updateAdmin({
        id: adminId,
        data: {
          twoFactorEnabled: false,
        },
      }).unwrap();
      setMessageModalContent({
        title: 'Success',
        message: '2FA has been reset successfully.',
        type: 'success',
      });
      setShowMessageModal(true);
    } catch (error) {
      console.error('Failed to reset 2FA:', error);
      setMessageModalContent({
        title: 'Error',
        message: 'Failed to reset 2FA. Please try again.',
        type: 'error',
      });
      setShowMessageModal(true);
    }
  };

  const handleForcePasswordResetClick = async () => {
    if (!confirm('Are you sure you want to force a password reset for this admin? They will need to reset their password on next login.')) {
      return;
    }

    try {
      await forcePasswordReset(adminId).unwrap();
      setMessageModalContent({
        title: 'Success',
        message: 'Password reset has been initiated successfully.',
        type: 'success',
      });
      setShowMessageModal(true);
    } catch (error) {
      console.error('Failed to force password reset:', error);
      setMessageModalContent({
        title: 'Error',
        message: 'Failed to force password reset. Please try again.',
        type: 'error',
      });
      setShowMessageModal(true);
    }
  };

  const handleRevokeAllSessionsClick = async () => {
    if (!confirm('Are you sure you want to revoke all active sessions for this admin? They will be logged out from all devices.')) {
      return;
    }

    try {
      // Revoke sessions by forcing password reset which invalidates all tokens
      await forcePasswordReset(adminId).unwrap();
      setMessageModalContent({
        title: 'Success',
        message: 'All sessions have been revoked successfully. The admin has been logged out from all devices.',
        type: 'success',
      });
      setShowMessageModal(true);
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
      setMessageModalContent({
        title: 'Error',
        message: 'Failed to revoke sessions. Please try again.',
        type: 'error',
      });
      setShowMessageModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/superadmin/management"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Audit: {admin.name}</h1>
              <p className="text-gray-500">Detailed oversight and account management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium">
              {admin.role}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-medium border border-gray-300">
              {admin.status}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-medium border border-gray-300">
              2FA Active
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button 
            onClick={openEditModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Edit Admin Role
          </button>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspend Account
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Profile and Permissions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Admin Profile & Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Admin Profile & Contact</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {admin.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">{admin.name}</div>
              <div className="text-gray-500">{admin.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
              <input
                type="text"
                value={admin.name}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
              <input
                type="email"
                value={admin.email}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Date Added</label>
              <input
                type="text"
                value={new Date(admin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Admin ID</label>
              <input
                type="text"
                value={admin.id}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-orange-600 mb-3">Security Information</h3>
            <div className="space-y-2 text-sm">
              <div className="text-orange-600">
                <span className="font-medium">Last Login:</span>{' '}
                {admin.lastLogin && !isNaN(new Date(admin.lastLogin).getTime())
                  ? new Date(admin.lastLogin).toLocaleString()
                  : 'Never'}
              </div>
              {admin.lastPasswordReset && !isNaN(new Date(admin.lastPasswordReset).getTime()) && (
                <div className="text-orange-600">
                  <span className="font-medium">Last Password Reset:</span> {new Date(admin.lastPasswordReset).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Role & Permissions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Assigned Role & Permissions</h2>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Current Role</span>
              <span className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                {admin.role}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Permissions & Module Access</h3>
            <div className="space-y-3">
              {permissionsList.map((permission, index) => (
                <div key={index} className="flex items-center gap-3">
                  {permission.enabled ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-gray-700">{permission.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Security & Access Management</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Two-Factor Authentication */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Two-Factor Authentication</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-300">
                Active
              </span>
            </div>
            <button 
              onClick={handleForce2FAResetClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Force 2FA Reset
            </button>
          </div>

          {/* Password Security */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Password Security</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium border border-gray-300">
                Secure
              </span>
            </div>
            <button 
              onClick={handleForcePasswordResetClick}
              disabled={isResettingPassword}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {isResettingPassword ? 'Resetting...' : 'Force Password Reset'}
            </button>
          </div>

          {/* Active Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Active Sessions</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium border border-gray-300">
                N/A
              </span>
            </div>
            <button 
              onClick={handleRevokeAllSessionsClick}
              disabled={isResettingPassword}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isResettingPassword ? 'Revoking...' : 'Revoke All Sessions'}
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Admin Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Detailed Admin Activity Log</h2>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="payout">Payout</option>
              <option value="report">Report</option>
              <option value="settings">Settings</option>
            </select>
            <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto">
          {isLoadingActivity ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activity log...</p>
            </div>
          ) : activityLog.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No activity recorded yet</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Timestamp</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Action</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Details</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLog.slice((currentPage - 1) * activitiesPerPage, currentPage * activitiesPerPage).map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-center text-gray-600">
                        {new Date(activity.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-900 font-medium">{activity.action}</td>
                      <td className="py-4 px-4 text-center text-gray-600">{activity.reason || 'N/A'}</td>
                      <td className="py-4 px-4 text-center text-gray-600">
                        {activity.targetType}: {activity.targetId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-gray-500">
                  Showing {Math.min((currentPage - 1) * activitiesPerPage + 1, totalActivities)}-{Math.min(currentPage * activitiesPerPage, totalActivities)} of {totalActivities} activities
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Admin Details</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="FINANCIAL_ADMIN">Financial Admin</option>
                  <option value="CONTENT_ADMIN">Content Admin</option>
                  <option value="SUPPORT_SPECIALIST">Support Specialist</option>
                  <option value="ANALYTICS_ADMIN">Analytics Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INVITED">Invited</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditRole('');
                  setEditStatus('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAdmin}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              {messageModalContent.type === 'success' ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{messageModalContent.title}</h3>
            </div>
            
            <p className="text-gray-600 mb-6">{messageModalContent.message}</p>

            <button
              onClick={() => setShowMessageModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
