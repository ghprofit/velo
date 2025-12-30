'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutModal from '@/components/LogoutModal';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [settingsTab, setSettingsTab] = useState('Profile Info');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [fullName, setFullName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex.johnson@email.com');
  const [dateOfBirth, setDateOfBirth] = useState('January 15, 1990');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'upload', label: 'Upload Content', icon: 'upload', href: '/dashboard/upload' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', href: '/dashboard/analytics' },
    { id: 'earnings', label: 'Earnings', icon: 'earnings', href: '/dashboard/earnings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', href: '/dashboard/notifications' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/dashboard/settings' },
    { id: 'support', label: 'Support', icon: 'support', href: '/dashboard/support' },
  ];

  const settingsTabs = ['Profile Info', 'Payouts', 'Security', 'Notifications', 'Danger Zone'];

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile saved:', { fullName, email, dateOfBirth });
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
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Settings Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex items-center gap-8 overflow-x-auto">
              {settingsTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    settingsTab === tab
                      ? 'border-indigo-600 text-indigo-600'
                      : tab === 'Danger Zone'
                      ? 'border-transparent text-red-600 hover:text-red-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Info Tab */}
          {settingsTab === 'Profile Info' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Information</h2>

              <form onSubmit={handleSaveProfile} className="space-y-8">
                {/* Profile Photo */}
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-700 font-medium mb-1"
                    >
                      Change Photo
                    </button>
                    <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-900 mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="text"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Save Button */}
                <div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payouts Tab */}
          {settingsTab === 'Payouts' && (
            <div className="max-w-5xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payouts</h2>
                  <p className="text-gray-600">Manage your primary payout method and financial details securely.</p>
                </div>
                <span className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg">
                  Payout Status: Verified
                </span>
              </div>

              {/* Payout Threshold & Fee Guide */}
              <div className="flex items-center gap-2 mb-8">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <a href="#" className="text-green-600 hover:text-green-700 font-medium text-sm">
                  Payout Threshold & Fee Guide
                </a>
              </div>

              {/* Payout Method Selection */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Payout Method Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Preferred Payout Method
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                      <option>Local Bank Account</option>
                      <option>PayPal</option>
                      <option>Wire Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Payout Currency
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Bank Account Details</h3>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm text-green-800">Your financial data is encrypted and stored securely.</p>
                </div>

                <form className="space-y-6">
                  {/* Account Holder Name */}
                  <div>
                    <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-900 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      id="accountHolder"
                      type="text"
                      value="Sarah Chen"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">This name is automatically pulled from your verified KYC information</p>
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-900 mb-2">
                      Bank Name
                    </label>
                    <input
                      id="bankName"
                      type="text"
                      placeholder="Enter your bank name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Routing Number */}
                  <div>
                    <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-900 mb-2">
                      Routing Number
                    </label>
                    <input
                      id="routingNumber"
                      type="text"
                      placeholder="9-digit routing number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">9-digit code found on your checks or bank statements</p>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-900 mb-2">
                      Account Number
                    </label>
                    <input
                      id="accountNumber"
                      type="text"
                      placeholder="Enter account number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Confirm Account Number */}
                  <div>
                    <label htmlFor="confirmAccountNumber" className="block text-sm font-medium text-gray-900 mb-2">
                      Confirm Account Number
                    </label>
                    <input
                      id="confirmAccountNumber"
                      type="text"
                      placeholder="Re-enter account number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Update Button */}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Update Payout Details
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {settingsTab === 'Security' && (
            <div className="max-w-5xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Security</h2>
                <p className="text-gray-600">Protect your account with a strong password and two-factor authentication.</p>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Your Password</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Password */}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-900 mb-2">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-2">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                      {/* Password Strength Indicator */}
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
                        </div>
                        <p className="mt-1 text-xs text-green-600 font-medium">Strong</p>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-900 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmNewPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication (2FA)</h3>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security by requiring a code from your mobile device when logging in.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">2FA is Active</p>
                      <p className="text-sm text-gray-600">Your account is protected with two-factor authentication</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Manage Recovery Codes
                  </button>
                </div>
              </div>

              {/* Recent Login Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Login Activity</h3>
                    <p className="text-sm text-gray-600">
                      Review devices and locations that have recently accessed your VELO account.
                    </p>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                    Log out from all devices
                  </button>
                </div>

                {/* Login Activity List */}
                <div className="space-y-4">
                  {/* Current Session */}
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">MacBook • Chrome</p>
                        <p className="text-sm text-gray-600">San Francisco, CA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">2 minutes ago</p>
                      <p className="text-xs text-green-600 font-medium">Current session</p>
                    </div>
                  </div>

                  {/* iPhone */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">iPhone • Safari</p>
                        <p className="text-sm text-gray-600">San Francisco, CA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">3 hours ago</p>
                      <p className="text-xs text-gray-500">Successful login</p>
                    </div>
                  </div>

                  {/* MacBook Previous */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">MacBook • Chrome</p>
                        <p className="text-sm text-gray-600">San Francisco, CA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">Yesterday</p>
                      <p className="text-xs text-gray-500">Successful login</p>
                    </div>
                  </div>

                  {/* iPad */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">iPad • Safari</p>
                        <p className="text-sm text-gray-600">Los Angeles, CA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">2 days ago</p>
                      <p className="text-xs text-gray-500">Successful login</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {settingsTab === 'Notifications' && (
            <div className="max-w-5xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications Preferences</h2>
                <p className="text-gray-600">Control which emails and in-app alerts you receive from VELO.</p>
              </div>

              {/* Earning & Engagement Updates */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Earning & Engagement Updates</h3>

                <div className="space-y-6">
                  {/* Payout updates */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Payout updates</h4>
                      <p className="text-sm text-gray-600">Receive alerts when payouts are processed or there's a payment issue.</p>
                    </div>
                    <div className="ml-6">
                      <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* New content engagement */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">New content engagement</h4>
                      <p className="text-sm text-gray-600">Receive alerts when your content is unlocked or there is a purchase.</p>
                    </div>
                    <div className="ml-6">
                      <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform & Marketing */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform & Marketing</h3>

                <div className="space-y-6">
                  {/* Platform announcements */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Platform announcements</h4>
                      <p className="text-sm text-gray-600">Important information regarding system updates, new features, or terms changes.</p>
                    </div>
                    <div className="ml-6">
                      <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Disable marketing emails */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Disable marketing emails</h4>
                      <p className="text-sm text-gray-600">Opt-out of non-essential promotional or marketing communications.</p>
                    </div>
                    <div className="ml-6">
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-save notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-900">
                  <strong>Auto-save enabled:</strong> Your notification preferences are automatically saved when you make changes. Use the "Save Changes" button at the top to apply all settings changes across your account.
                </p>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {settingsTab === 'Danger Zone' && (
            <div className="max-w-5xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Danger Zone</h2>
                <div className="flex items-start gap-3 border-l-4 border-red-600 pl-4 py-2">
                  <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Proceed with Extreme Caution</h3>
                    <p className="text-sm text-gray-700">
                      These actions are irreversible and may result in the loss of data and access to your account. Please read each option carefully before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deactivate Account */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Account (Temporary)</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Temporarily hide your content and profile from the VELO platform. Your data will be preserved, and you can reactivate your account at any time by logging back in with your credentials.
                      </p>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                        <p className="text-sm text-blue-900 flex items-start gap-2">
                          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Your account will be hidden but not deleted. All data remains intact.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors whitespace-nowrap ml-4">
                    Deactivate Account
                  </button>
                </div>
              </div>

              {/* Delete Account Permanently */}
              <div className="bg-white rounded-xl border-2 border-red-500 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account Permanently</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        <strong>This action is final and cannot be undone.</strong> All content, data, earnings history, and account information will be permanently deleted from our servers and cannot be recovered under any circumstances.
                      </p>

                      {/* Warning notice */}
                      <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
                        <p className="text-sm text-red-900 flex items-start gap-2">
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>
                            <strong>Before deleting, please ensure your Payouts balance is empty and all pending transactions are complete.</strong>
                          </span>
                        </p>
                      </div>

                      {/* Consequences list */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>All projects and content will be removed</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Earnings history will be permanently deleted</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Your username will become available for others</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap ml-4">
                    Delete Account Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
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
