'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/auth-context';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface Session {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab] = useState('settings');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [toast, setToast] = useState<Toast | null>(null);

  // Profile Settings State - Initialize from user context
  const [adminName, setAdminName] = useState('');
  const [adminBio, setAdminBio] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [originalAdminName, setOriginalAdminName] = useState('');
  const [originalAdminEmail, setOriginalAdminEmail] = useState('');
  const [originalAdminRole, setOriginalAdminRole] = useState('');
  const [originalAdminBio, setOriginalAdminBio] = useState('');

  // Security Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newCreatorAlert, setNewCreatorAlert] = useState(true);
  const [paymentAlert, setPaymentAlert] = useState(true);
  const [reportAlert, setReportAlert] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, ] = useState('');

  // Platform Settings State
  const [platformName, setPlatformName] = useState('VeloLink');
  const [platformEmail, setPlatformEmail] = useState('support@velolink.club');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  // Initialize profile data from user context
  useEffect(() => {
    if (user) {
      // Use adminProfile.fullName for admin users, or creatorProfile.displayName for creators
      const displayName = user.adminProfile?.fullName 
        || user.creatorProfile?.displayName 
        || user.email.split('@')[0];
      
      const roleDisplay = user.adminRole 
        ? user.adminRole.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
        : user.role;
      
      setAdminName(displayName);
      setAdminEmail(user.email);
      setAdminRole(roleDisplay);
      setOriginalAdminName(displayName);
      setOriginalAdminEmail(user.email);
      setOriginalAdminRole(roleDisplay);
    }
  }, [user]);

  // Load data on mount
  useEffect(() => {
    loadNotificationSettings();
    loadActiveSessions();
  }, []);

  // Toast notification handler
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // API Functions
  const loadNotificationSettings = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.emailNotifications ?? true);
        setPushNotifications(data.pushNotifications ?? true);
        setNewCreatorAlert(data.newCreatorAlert ?? true);
        setPaymentAlert(data.paymentAlert ?? true);
        setReportAlert(data.reportAlert ?? true);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadActiveSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch('/api/admin/sessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Profile Settings Functions
  const handleSaveProfile = async () => {
    setProfileError('');
    if (!adminName.trim()) {
      setProfileError('Full name is required');
      return;
    }
    if (!adminEmail.trim()) {
      setProfileError('Email is required');
      return;
    }
    if (!adminEmail.includes('@')) {
      setProfileError('Please enter a valid email');
      return;
    }

    try {
      setProfileLoading(true);
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          role: adminRole,
          bio: adminBio
        })
      });

      if (response.ok) {
        setOriginalAdminName(adminName);
        setOriginalAdminEmail(adminEmail);
        setOriginalAdminRole(adminRole);
        setOriginalAdminBio(adminBio);
        showToast('Profile updated successfully', 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to update profile', 'error');
      }
    } catch {
      showToast('An error occurred while updating profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setAdminName(originalAdminName);
    setAdminEmail(originalAdminEmail);
    setAdminRole(originalAdminRole);
    setAdminBio(originalAdminBio);
    setProfileError('');
  };

  // Password Change Functions
  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password changed successfully', 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to change password', 'error');
      }
    } catch {
      showToast('An error occurred while changing password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Two-Factor Authentication Functions
  const handleToggle2FA = async (enabled: boolean) => {
    try {
      setTwoFactorLoading(true);

      if (enabled) {
        // Generate QR code
        const response = await fetch('/api/admin/2fa/setup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQrCode(data.qrCode);
          setTwoFactorSecret(data.secret);
          setBackupCodes(data.backupCodes);
          setTwoFactorEnabled(true);
          showToast('2FA setup initiated. Scan the QR code and confirm.', 'success');
        } else {
          showToast('Failed to setup 2FA', 'error');
        }
      } else {
        // Disable 2FA
        const response = await fetch('/api/admin/2fa/disable', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setTwoFactorEnabled(false);
          setQrCode('');
          setTwoFactorSecret('');
          setBackupCodes([]);
          showToast('2FA disabled', 'success');
        } else {
          showToast('Failed to disable 2FA', 'error');
        }
      }
    } catch {
      showToast('An error occurred with 2FA', 'error');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Session Management Functions
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadActiveSessions();
        showToast('Session revoked successfully', 'success');
      } else {
        showToast('Failed to revoke session', 'error');
      }
    } catch {
      showToast('An error occurred while revoking session', 'error');
    }
  };

  // Notification Settings Functions
  const handleSaveNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          emailNotifications,
          pushNotifications,
          newCreatorAlert,
          paymentAlert,
          reportAlert
        })
      });

      if (response.ok) {
        showToast('Notification preferences saved', 'success');
      } else {
        showToast('Failed to save notification preferences', 'error');
      }
    } catch {
      showToast('An error occurred while saving preferences', 'error');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
  ];

  const renderTabIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      lock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      bell: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      grid: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your admin preferences and platform configuration</p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to Default
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Settings Tabs - Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <nav className="space-y-2">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        settingsTab === tab.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {renderTabIcon(tab.icon)}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {/* Toast Notifications */}
              {toast && (
                <div className={`mb-4 p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {toast.message}
                </div>
              )}

              {/* Profile Settings */}
              {settingsTab === 'profile' && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                  {profileError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      {profileError}
                    </div>
                  )}

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        disabled={profileLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        disabled={profileLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={adminRole}
                        disabled={true}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        placeholder="Write a brief description about yourself..."
                        value={adminBio}
                        onChange={(e) => setAdminBio(e.target.value)}
                        disabled={profileLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none disabled:bg-gray-50"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={profileLoading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-semibold"
                      >
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelProfile}
                        disabled={profileLoading}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {settingsTab === 'security' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Change Password</h2>

                    {passwordError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {passwordError}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={passwordLoading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={passwordLoading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          At least 8 characters, 1 uppercase, 1 lowercase, 1 number
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={passwordLoading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50"
                        />
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-semibold"
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Two-Factor Authentication</h2>

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Enable 2FA</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account by requiring a verification code in addition to your password.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={twoFactorEnabled}
                          onChange={(e) => handleToggle2FA(e.target.checked)}
                          disabled={twoFactorLoading}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                      </label>
                    </div>

                    {twoFactorEnabled && qrCode && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 mb-4">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc):</p>
                        <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                          <img src={qrCode} alt="2FA QR Code" className="w-full h-full" />
                        </div>
                        <p className="text-sm text-gray-700 mb-2 font-semibold">Or enter this code manually:</p>
                        <p className="text-xs font-mono font-semibold bg-gray-100 p-2 rounded mb-4 break-all">{twoFactorSecret}</p>
                        
                        {backupCodes.length > 0 && (
                          <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Save your backup codes:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {backupCodes.map((code, idx) => (
                                <code key={idx} className="text-xs bg-white p-2 rounded border border-gray-200 font-mono">
                                  {code}
                                </code>
                              ))}
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Store these codes in a safe place. Each can be used once if you lose access to your authenticator.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Active Sessions</h2>

                    {sessionsLoading ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading sessions...</p>
                      </div>
                    ) : activeSessions.length > 0 ? (
                      <div className="space-y-4">
                        {activeSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 ${session.isCurrent ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                                <svg className={`w-5 h-5 ${session.isCurrent ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{session.deviceName}</p>
                                <p className="text-xs text-gray-600">{session.ipAddress} • Last active: {session.lastActive}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {session.isCurrent && (
                                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Current</span>
                              )}
                              {!session.isCurrent && (
                                <button
                                  onClick={() => handleRevokeSession(session.id)}
                                  className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No active sessions found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {settingsTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                  {notificationsError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      {notificationsError}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* General Notifications */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4">General Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                            <p className="text-xs text-gray-600">Receive notifications via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailNotifications}
                              onChange={(e) => setEmailNotifications(e.target.checked)}
                              disabled={notificationsLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                            <p className="text-xs text-gray-600">Receive push notifications in your browser</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pushNotifications}
                              onChange={(e) => setPushNotifications(e.target.checked)}
                              disabled={notificationsLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Alert Types */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Alert Types</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">New Creator Registrations</p>
                            <p className="text-xs text-gray-600">Get notified when new creators sign up</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newCreatorAlert}
                              onChange={(e) => setNewCreatorAlert(e.target.checked)}
                              disabled={notificationsLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment Transactions</p>
                            <p className="text-xs text-gray-600">Get notified about payment activities</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={paymentAlert}
                              onChange={(e) => setPaymentAlert(e.target.checked)}
                              disabled={notificationsLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Content Reports</p>
                            <p className="text-xs text-gray-600">Get notified when content is reported</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={reportAlert}
                              onChange={(e) => setReportAlert(e.target.checked)}
                              disabled={notificationsLoading}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleSaveNotifications}
                        disabled={notificationsLoading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-semibold"
                      >
                        {notificationsLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Settings */}
              {settingsTab === 'platform' && (
                <div className="space-y-6">
                  {/* General Platform Settings */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Platform Configuration</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                        <input
                          type="text"
                          value={platformName}
                          onChange={(e) => setPlatformName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                        <input
                          type="email"
                          value={platformEmail}
                          onChange={(e) => setPlatformEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                        <textarea
                          rows={4}
                          placeholder="Describe your platform..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                          <p className="text-xs text-gray-600">Disable public access to the platform</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={maintenanceMode}
                            onChange={(e) => setMaintenanceMode(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">User Registration</p>
                          <p className="text-xs text-gray-600">Allow new users to register</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registrationEnabled}
                            onChange={(e) => setRegistrationEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                        Save Configuration
                      </button>
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Payment Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Fee (%)</label>
                        <input
                          type="number"
                          placeholder="15"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Percentage of each transaction taken as platform fee</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout Amount ($)</label>
                        <input
                          type="number"
                          placeholder="50"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum balance required for creator payouts</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                          <option>USD - US Dollar</option>
                          <option>EUR - Euro</option>
                          <option>GBP - British Pound</option>
                          <option>CAD - Canadian Dollar</option>
                        </select>
                      </div>

                      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                        Save Payment Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {settingsTab === 'integrations' && (
                <div className="space-y-6">
                  {/* Payment Gateways */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Payment Gateways</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-sm">ST</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Stripe</p>
                            <p className="text-xs text-gray-600">Credit card and payment processing</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Connected</span>
                          <button className="text-sm text-indigo-600 hover:text-indigo-700">Configure</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">PP</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">PayPal</p>
                            <p className="text-xs text-gray-600">PayPal payment integration</p>
                          </div>
                        </div>
                        <button className="text-sm px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Storage */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Cloud Storage</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-sm">S3</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">AWS S3</p>
                            <p className="text-xs text-gray-600">Amazon Web Services storage</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Active</span>
                          <button className="text-sm text-indigo-600 hover:text-indigo-700">Configure</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 font-bold text-sm">CF</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Cloudflare R2</p>
                            <p className="text-xs text-gray-600">Cloudflare object storage</p>
                          </div>
                        </div>
                        <button className="text-sm px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Service */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Email Service</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <span className="text-teal-600 font-bold text-sm">SG</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">SendGrid</p>
                            <p className="text-xs text-gray-600">Email delivery service</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Active</span>
                          <button className="text-sm text-indigo-600 hover:text-indigo-700">Configure</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
