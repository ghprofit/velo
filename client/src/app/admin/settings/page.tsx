'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import LogoutModal from '@/components/LogoutModal';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');

  // Profile Settings State
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('admin@velolink.com');
  const [adminRole, setAdminRole] = useState('Super Admin');

  // Security Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newCreatorAlert, setNewCreatorAlert] = useState(true);
  const [paymentAlert, setPaymentAlert] = useState(true);
  const [reportAlert, setReportAlert] = useState(true);

  // Platform Settings State
  const [platformName, setPlatformName] = useState('VeloLink');
  const [platformEmail, setPlatformEmail] = useState('support@velolink.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'platform', label: 'Platform', icon: 'settings' },
    { id: 'integrations', label: 'Integrations', icon: 'grid' },
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
      <AdminSidebar activeTab={activeTab} onLogout={() => setShowLogoutModal(true)} />

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
              {/* Profile Settings */}
              {settingsTab === 'profile' && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                  {/* Profile Photo */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-semibold">A</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Change Photo
                        </button>
                        <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={adminRole}
                        onChange={(e) => setAdminRole(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        <option>Super Admin</option>
                        <option>Admin</option>
                        <option>Moderator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        placeholder="Write a brief description about yourself..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                        Save Changes
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                        Update Password
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
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {twoFactorEnabled && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 mb-4">Scan this QR code with your authenticator app:</p>
                        <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-gray-400">QR Code Placeholder</span>
                        </div>
                        <p className="text-xs text-gray-600">Or enter this code manually: <span className="font-mono font-semibold">ABCD-EFGH-IJKL-MNOP</span></p>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Active Sessions</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Windows 11 - Chrome</p>
                            <p className="text-xs text-gray-600">127.0.0.1 • Last active: Now</p>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Current</span>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">iPhone 15 - Safari</p>
                            <p className="text-xs text-gray-600">192.168.1.5 • Last active: 2 hours ago</p>
                          </div>
                        </div>
                        <button className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {settingsTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

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
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                        Save Preferences
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
