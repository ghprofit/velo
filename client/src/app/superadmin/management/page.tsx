'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useForcePasswordResetMutation,
} from '@/state/api';

// Role mapping between frontend display names and backend enum values
const roleToEnum: Record<string, 'FINANCIAL_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_SPECIALIST' | 'ANALYTICS_ADMIN'> = {
  'Financial Admin': 'FINANCIAL_ADMIN',
  'Content Admin': 'CONTENT_ADMIN',
  'Support Specialist': 'SUPPORT_SPECIALIST',
  'Analytics Admin': 'ANALYTICS_ADMIN',
};

// const enumToRole: Record<string, string> = {
//   'FINANCIAL_ADMIN': 'Financial Admin',
//   'CONTENT_ADMIN': 'Content Admin',
//   'SUPPORT_SPECIALIST': 'Support Specialist',
//   'ANALYTICS_ADMIN': 'Analytics Admin',
// };

const roleColors: Record<string, string> = {
  'Financial Admin': 'bg-orange-100 text-orange-700 border-orange-300',
  'Content Admin': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Support Specialist': 'bg-green-100 text-green-700 border-green-300',
  'Analytics Admin': 'bg-red-100 text-red-600 border-red-300',
};

const statusColors: Record<string, string> = {
  Active: 'text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full',
  Suspended: 'text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full',
  Invited: 'text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full',
};

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  isActive: boolean;
  permissions: {
    dashboard: boolean;
    creatorManagement: boolean;
    contentReview: boolean;
    financialReports: boolean;
    systemSettings: boolean;
    supportTickets: boolean;
  };
  twoFactorEnabled: boolean;
  lastPasswordReset?: string;
}

export default function SuperAdminManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [createdAdminEmail, setCreatedAdminEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // API hooks
  const { data: adminsData, isLoading, error } = useGetAdminsQuery({
    search: searchQuery || undefined,
    role: roleFilter !== 'all' ? roleToEnum[roleFilter] : undefined,
  });
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();
  const [forcePasswordReset] = useForcePasswordResetMutation();

  // Form state for add modal
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Financial Admin',
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: '',
    isActive: true,
    permissions: {
      dashboard: true,
      creatorManagement: false,
      contentReview: false,
      financialReports: true,
      systemSettings: false,
      supportTickets: false,
    },
  });

  const roleDescriptions: Record<string, string> = {
    'Financial Admin': 'Financial Admin has full access to financial reports, transaction management, payment processing, revenue analytics, and audit logs.',
    'Content Admin': 'Content Admin has full access to content moderation, creator management, flagged content review, and content analytics.',
    'Support Specialist': 'Support Specialist has access to user support tickets, profile management, and support analytics.',
    'Analytics Admin': 'Analytics Admin has access to all platform analytics, custom report generation, and data export capabilities.',
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      fullName: admin.name,
      role: admin.role,
      isActive: admin.status === 'Active',
      permissions: admin.permissions,
    });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      await updateAdmin({
        id: selectedAdmin.id,
        data: {
          fullName: editForm.fullName,
          role: roleToEnum[editForm.role],
          isActive: editForm.isActive,
          permissions: editForm.permissions,
        },
      }).unwrap();
      setShowEditModal(false);
      setSelectedAdmin(null);
    } catch (err) {
      console.error('Failed to update admin:', err);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    try {
      await deleteAdmin(id).unwrap();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete admin:', err);
    }
  };

  const handleForceReset = async () => {
    if (!selectedAdmin) return;
    try {
      await forcePasswordReset(selectedAdmin.id).unwrap();
    } catch (err) {
      console.error('Failed to force password reset:', err);
    }
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAdminForm(prev => ({ ...prev, password, confirmPassword: password }));
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newAdminForm.password !== newAdminForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await createAdmin({
        fullName: newAdminForm.fullName,
        email: newAdminForm.email,
        password: newAdminForm.password,
        role: roleToEnum[newAdminForm.role],
      }).unwrap();

      setCreatedAdminEmail(newAdminForm.email);
      setShowAddModal(false);
      setShowSuccessNotification(true);

      // Reset form
      setNewAdminForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Financial Admin',
      });

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to create admin:', err);
    }
  };

  // Filter admins locally for search (API also filters, but this provides instant feedback)
  const filteredAdmins = useMemo(() => {
    const admins = adminsData?.data || [];
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [adminsData?.data, searchQuery, roleFilter]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin & Permissions Management</h1>
          <p className="text-gray-500 mt-1">Manage administrator accounts, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Administrator
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left Section - Admin Table */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by Name or Email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-600"
                />
              </div>
              <div className="relative min-w-[200px]">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none cursor-pointer"
                >
                  <option value="all">Filter by Role</option>
                  <option value="Financial Admin">Financial Admin</option>
                  <option value="Content Admin">Content Admin</option>
                  <option value="Support Specialist">Support Specialist</option>
                  <option value="Analytics Admin">Analytics Admin</option>
                </select>
                <svg
                  className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading admins...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Failed to load administrators. Please try again.
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredAdmins.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No administrators found</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Add your first administrator
                </button>
              </div>
            )}

            {/* Table */}
            {!isLoading && !error && filteredAdmins.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Name/Email</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Current Role</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Last Login</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Status</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {admin.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{admin.name}</div>
                              <div className="text-sm text-gray-500">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${roleColors[admin.role] || 'bg-gray-100 text-gray-700 border-gray-300'}`}
                          >
                            {admin.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">{admin.lastLogin}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block text-sm font-medium ${statusColors[admin.status] || 'text-gray-600'}`}>
                            {admin.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              href={`/superadmin/admin/${admin.id}`}
                              className="text-gray-500 hover:text-green-600 transition-colors"
                              title="View Audit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleEditAdmin(admin)}
                              className="text-gray-500 hover:text-indigo-600 transition-colors"
                              title="Edit Admin"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(admin.id)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete Admin"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Role Definitions & Security Notes */}
        <div className="w-80 space-y-6">
          {/* Role Definitions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Role Definitions</h3>
            </div>

            <div className="space-y-6">
              {/* Financial Admin */}
              <div>
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg text-sm font-medium mb-3">
                  Financial Admin
                </span>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve and process payouts
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View financial reports
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Manage payment settings
                  </li>
                </ul>
              </div>

              {/* Content Admin */}
              <div>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg text-sm font-medium mb-3">
                  Content Admin
                </span>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Content moderation
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Review flagged content
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Manage creator accounts
                  </li>
                </ul>
              </div>

              {/* Support Specialist */}
              <div>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-lg text-sm font-medium mb-3">
                  Support Specialist
                </span>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Handle user support tickets
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Access user profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View support analytics
                  </li>
                </ul>
              </div>

              {/* Analytics Admin */}
              <div>
                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 border border-red-300 rounded-lg text-sm font-medium mb-3">
                  Analytics Admin
                </span>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Access all analytics data
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Generate custom reports
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Export platform data
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Security Notes</h3>
            </div>

            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 shrink-0"></div>
                <span>All Admin actions are logged for auditing purposes</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 shrink-0"></div>
                <span>2FA is required for all Admin accounts</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 shrink-0"></div>
                <span>Admin passwords expire every 90 days</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Administrator</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAdmin(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">Administrator Account Created Successfully!</h3>
                  <button
                    onClick={() => setShowSuccessNotification(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  An invitation and temporary login credentials have been sent to{' '}
                  <span className="font-medium">{createdAdminEmail}</span>
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Administrator</h2>
                  <p className="text-gray-500 mt-1">
                    Provide the new admin&apos;s credentials and assign their initial role.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-6">
              {/* Account Credentials Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Account Credentials</h3>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminForm.fullName}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Enter administrator's full name"
                    />
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminForm.email}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="admin@company.com"
                    />
                  </div>

                  {/* Temporary Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={newAdminForm.password}
                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Enter temporary password"
                      />
                      <button
                        type="button"
                        onClick={generateSecurePassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Generate Secure
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminForm.confirmPassword}
                      onChange={(e) => setNewAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Confirm temporary password"
                    />
                  </div>

                  {/* Info Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-blue-700">
                      The admin will be prompted to change their password upon first login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Assignment Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Role Assignment</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newAdminForm.role}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="Financial Admin">Financial Admin</option>
                    <option value="Content Admin">Content Admin</option>
                    <option value="Support Specialist">Support Specialist</option>
                    <option value="Analytics Admin">Analytics Admin</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Details: {selectedAdmin.name}</h2>
                  <p className="text-gray-500 mt-1">
                    View and modify administrator account settings and permissions.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateAdmin} className="p-6 space-y-6">
              {/* Account Information Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                </div>

                <div className="space-y-4">
                  {/* Avatar and Email Row */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedAdmin.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={selectedAdmin.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  {/* Last Login */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                      {selectedAdmin.lastLogin === '-' ? 'Never logged in' : selectedAdmin.lastLogin}
                    </div>
                  </div>

                  {/* Account Status Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Account Status</label>
                      <p className="text-sm text-gray-500">Enable or disable this admin account</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editForm.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editForm.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Manage Role & Access Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Manage Role & Access</h3>
                </div>

                <div className="space-y-4">
                  {/* Current Role Badge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${roleColors[editForm.role] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                      {editForm.role}
                    </span>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="Financial Admin">Financial Admin</option>
                      <option value="Content Admin">Content Admin</option>
                      <option value="Support Specialist">Support Specialist</option>
                      <option value="Analytics Admin">Analytics Admin</option>
                    </select>
                    {/* Role Description */}
                    <p className="mt-2 text-sm text-gray-500">{roleDescriptions[editForm.role]}</p>
                  </div>

                  {/* Permissions Checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.dashboard}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, dashboard: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Dashboard</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.creatorManagement}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, creatorManagement: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Creator Management</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.contentReview}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, contentReview: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Content Review</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.financialReports}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, financialReports: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Financial Reports</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.systemSettings}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, systemSettings: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">System Settings</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.supportTickets}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, supportTickets: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Support Tickets</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Audit Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Security & Audit</h3>
                </div>

                <div className="space-y-4">
                  {/* 2FA Status */}
                  <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className={`w-5 h-5 ${selectedAdmin.twoFactorEnabled ? 'text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                    </div>
                    <span className={`text-sm font-medium ${selectedAdmin.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {selectedAdmin.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {/* Last Password Reset */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Last Password Reset</label>
                      <p className="text-sm text-gray-500">
                        {selectedAdmin.lastPasswordReset || 'Never'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleForceReset}
                      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Force Reset
                    </button>
                  </div>

                  {/* View Activity Log */}
                  <Link
                    href={`/superadmin/admin/${selectedAdmin.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    View Admin Activity Log
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Admin Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-progress {
          animation: progress 5s linear;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
