'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  // Settings state
  const [settings, setSettings] = useState({
    // General Rules
    platformFeePercentage: 15,
    enableNewCreatorSignups: false,
    globalPayoutHoldPeriod: 7,
    // Notifications
    enablePlatformAnnouncements: true,
    adminSupportEmail: 'support@velo.com',
  });

  // Integrations state
  const [integrations, setIntegrations] = useState({
    // Stripe
    stripeApiKey: 'pk_live_',
    stripeSecretKey: 'sk_live_',
    stripeConnected: true,
    // ACH
    enableAchPayouts: true,
    achVendorId: 'ACH_VENDOR_12345',
    achReconciliationUrl: 'https://api.bank.com/reconcile',
    // Veriff
    veriffApiKey: 'vrf_',
    veriffWebhookUrl: 'https://api.velo.com/kyc/webhook',
    veriffConnected: true,
    requireKycForPayouts: true,
    kycRetryLimit: 3,
    // Google Analytics
    gaTrackingId: '',
    gaConnected: false,
    // Email Service Provider
    smtpHost: 'smtp.sendgrid.net',
    espApiKey: 'SG.',
    espConnected: true,
  });

  const handleIntegrationChange = (key: string, value: string | number | boolean) => {
    setIntegrations(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Branding state
  const [branding, setBranding] = useState({
    platformName: 'VeloLink',
    shortTagline: 'Empowering Creators',
    primaryAccentColor: '#6366F1',
    secondaryAccentColor: '#E0E7FF',
    backgroundColor: '#F8FAFC',
    enableDarkMode: true,
    showComingSoonFeatures: false,
  });

  const handleBrandingChange = (key: string, value: string | boolean) => {
    setBranding(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Security state
  const [security, setSecurity] = useState({
    require2faForSignups: true,
    passwordExpiryDays: 90,
    maxFailedLoginAttempts: 5,
    enableAccountLockout: true,
    enforceHttps: true,
    contentRetentionPolicy: '30',
    enableAutomatedContentScanning: true,
  });

  const handleSecurityChange = (key: string, value: string | number | boolean) => {
    setSecurity(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings);
    setHasUnsavedChanges(false);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'branding', label: 'Branding & UI' },
    { id: 'security', label: 'Security Rules' },
  ];

  return (
    <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings & Configuration</h1>
            <p className="text-gray-500 mt-1">
              {activeTab === 'integrations'
                ? 'Manage system integrations and third-party services'
                : activeTab === 'branding'
                ? 'Manage platform-wide settings and configurations'
                : activeTab === 'security'
                ? 'Manage platform-wide security and system policies'
                : 'Manage global platform settings and integrations'}
            </p>
          </div>
          <button
            onClick={handleSaveChanges}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save All Changes
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            {/* General Rules Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">General Rules</h2>

              <div className="space-y-6">
                {/* Global Platform Fee Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Global Platform Fee Percentage
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={settings.platformFeePercentage}
                      onChange={(e) => handleSettingChange('platformFeePercentage', parseInt(e.target.value) || 0)}
                      className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="text-gray-600">% of each transaction</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Changes require confirmation and affect all future transactions
                  </p>
                </div>

                {/* Enable New Creator Signups */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">
                        Enable New Creator Signups
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Allow new creators to register on the platform
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingChange('enableNewCreatorSignups', !settings.enableNewCreatorSignups)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.enableNewCreatorSignups ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.enableNewCreatorSignups ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Warning Banner */}
                  {!settings.enableNewCreatorSignups && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            Warning: Creator Signups Disabled
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            New creators cannot register. Enable this to allow platform growth.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Global Payout Hold Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Global Payout Hold Period
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={settings.globalPayoutHoldPeriod}
                      onChange={(e) => handleSettingChange('globalPayoutHoldPeriod', parseInt(e.target.value) || 0)}
                      className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      min="0"
                    />
                    <span className="text-gray-600">days before funds are released</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>

              <div className="space-y-6">
                {/* Enable Platform-Wide Email Announcements */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Enable Platform-Wide Email Announcements
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Send bulk emails to all users for major updates
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSettingChange('enablePlatformAnnouncements', !settings.enablePlatformAnnouncements)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enablePlatformAnnouncements ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enablePlatformAnnouncements ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Admin Support Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Admin Support Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.adminSupportEmail}
                    onChange={(e) => handleSettingChange('adminSupportEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="support@velo.com"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Where creators send support tickets and inquiries
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-8">
            {/* Payment Processing Integrations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Payment Processing Integrations</h2>
              </div>

              {/* Stripe Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Stripe</h3>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Connected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="password"
                      value={integrations.stripeApiKey + '••••••••••••••••••••••••••••••'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                    <input
                      type="password"
                      value={integrations.stripeSecretKey + '••••••••••••••••••••••••••••••'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-orange-600 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm">Keys require password confirmation to save.</span>
                </div>

                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Update Keys & Connect
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Test Connection
                  </button>
                </div>
              </div>

              {/* Local Bank Payouts (ACH) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Local Bank Payouts (ACH)</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleIntegrationChange('enableAchPayouts', !integrations.enableAchPayouts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integrations.enableAchPayouts ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integrations.enableAchPayouts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Enable ACH Payouts</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor ID</label>
                    <input
                      type="text"
                      value={integrations.achVendorId}
                      onChange={(e) => handleIntegrationChange('achVendorId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reconciliation Endpoint URL</label>
                    <input
                      type="text"
                      value={integrations.achReconciliationUrl}
                      onChange={(e) => handleIntegrationChange('achReconciliationUrl', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* User Verification Service (KYC/AML) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">User Verification Service (KYC/AML)</h2>
              </div>

              {/* Veriff Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">KYC Provider (Veriff)</h3>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Connected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="password"
                      value={integrations.veriffApiKey + '••••••••••••••••••••••••••••••'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                    <input
                      type="text"
                      value={integrations.veriffWebhookUrl}
                      onChange={(e) => handleIntegrationChange('veriffWebhookUrl', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Test Connection
                  </button>
                  <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Save Configuration
                  </button>
                </div>
              </div>

              {/* KYC Verification Requirements */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">KYC Verification Requirements</h3>
                    <p className="text-sm text-gray-500">Configure mandatory verification settings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleIntegrationChange('requireKycForPayouts', !integrations.requireKycForPayouts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integrations.requireKycForPayouts ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integrations.requireKycForPayouts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Require KYC for ALL Payouts</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Automatic Retry Limit</label>
                  <input
                    type="number"
                    value={integrations.kycRetryLimit}
                    onChange={(e) => handleIntegrationChange('kycRetryLimit', parseInt(e.target.value) || 0)}
                    className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Analytics & Marketing Tools */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Analytics & Marketing Tools</h2>
              </div>

              {/* Google Analytics */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Google Analytics</h3>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Disconnected
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking ID</label>
                  <input
                    type="text"
                    value={integrations.gaTrackingId}
                    onChange={(e) => handleIntegrationChange('gaTrackingId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                  Connect Analytics
                </button>
              </div>

              {/* Email Service Provider */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Email Service Provider (ESP)</h3>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Connected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server Host</label>
                    <input
                      type="text"
                      value={integrations.smtpHost}
                      onChange={(e) => handleIntegrationChange('smtpHost', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="password"
                      value={integrations.espApiKey + '••••••••••••••••••••••••••••••'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Send Test Email
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-8">
            {/* Platform Identity & Logos */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Platform Identity & Logos</h2>
                <p className="text-gray-500 mt-1">Configure your platform&apos;s visual identity and branding elements</p>
              </div>

              <div className="space-y-6">
                {/* Platform Name and Tagline */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                    <input
                      type="text"
                      value={branding.platformName}
                      onChange={(e) => handleBrandingChange('platformName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Tagline</label>
                    <input
                      type="text"
                      value={branding.shortTagline}
                      onChange={(e) => handleBrandingChange('shortTagline', e.target.value)}
                      placeholder="Empowering Creators"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Logo Uploads */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Platform Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Upload new logo
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Recommended: PNG, SVG. Max file size 2MB.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Upload favicon
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Recommended: ICO, PNG. Size: 32×32px.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Global User Interface Colors */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Global User Interface Colors</h2>
                <p className="text-gray-500 mt-1">Customize the color scheme for your platform</p>
              </div>

              <div className="space-y-6">
                {/* Color Inputs */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Accent Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-300"
                        style={{ backgroundColor: branding.primaryAccentColor }}
                      />
                      <input
                        type="text"
                        value={branding.primaryAccentColor}
                        onChange={(e) => handleBrandingChange('primaryAccentColor', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Used for primary buttons, highlights, and active states.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Accent Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-300"
                        style={{ backgroundColor: branding.secondaryAccentColor }}
                      />
                      <input
                        type="text"
                        value={branding.secondaryAccentColor}
                        onChange={(e) => handleBrandingChange('secondaryAccentColor', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Used for success messages and positive indicators.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-300"
                        style={{ backgroundColor: branding.backgroundColor }}
                      />
                      <input
                        type="text"
                        value={branding.backgroundColor}
                        onChange={(e) => handleBrandingChange('backgroundColor', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Main content panel background.</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Preview</h3>
                  <div className="flex items-center gap-4">
                    <button
                      style={{ backgroundColor: branding.primaryAccentColor }}
                      className="px-6 py-2 text-white rounded-lg font-medium"
                    >
                      Primary Button
                    </button>
                    <button className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium">
                      Success Button
                    </button>
                    <a
                      href="#"
                      style={{ color: branding.primaryAccentColor }}
                      className="font-medium hover:underline"
                    >
                      Sample Link
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Display & Experience Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Display & Experience Options</h2>
                <p className="text-gray-500 mt-1">Configure user interface behavior and feature visibility</p>
              </div>

              <div className="space-y-6">
                {/* Enable Dark Mode */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Enable Dark Mode for Users</label>
                    <p className="text-sm text-gray-500">Allow users to switch to a dark theme.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBrandingChange('enableDarkMode', !branding.enableDarkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      branding.enableDarkMode ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        branding.enableDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Coming Soon Features */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Show &quot;Coming Soon&quot; Features</label>
                    <p className="text-sm text-gray-500">Display features under development with a &apos;Coming Soon&apos; badge.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBrandingChange('showComingSoonFeatures', !branding.showComingSoonFeatures)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      branding.showComingSoonFeatures ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        branding.showComingSoonFeatures ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Authentication & Access Control */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Authentication & Access Control</h2>
              </div>

              <div className="space-y-6">
                {/* Require 2FA for ALL New Creator Signups */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Require 2FA for ALL New Creator Signups</label>
                    <p className="text-sm text-gray-500">Automatically enforce Two-Factor Authentication during new creator registration.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSecurityChange('require2faForSignups', !security.require2faForSignups)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.require2faForSignups ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.require2faForSignups ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Creator Password Expiry Period */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Creator Password Expiry Period</label>
                  <p className="text-sm text-gray-500 mb-3">Force creators to reset their password after this many days.</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={security.passwordExpiryDays}
                      onChange={(e) => handleSecurityChange('passwordExpiryDays', parseInt(e.target.value) || 0)}
                      className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      min="0"
                    />
                    <span className="text-gray-600">days</span>
                  </div>
                </div>

                {/* Max Failed Login Attempts */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Max Failed Login Attempts</label>
                  <p className="text-sm text-gray-500 mb-3">Lock an account after this many consecutive failed login attempts.</p>
                  <input
                    type="number"
                    value={security.maxFailedLoginAttempts}
                    onChange={(e) => handleSecurityChange('maxFailedLoginAttempts', parseInt(e.target.value) || 0)}
                    className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    min="1"
                  />
                </div>

                {/* Enable Account Lockout */}
                <div className="flex items-center justify-between py-2 border-t border-gray-200 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Enable Account Lockout for Excessive Failed Logins</label>
                    <p className="text-sm text-gray-500">Automatically lock accounts when max failed login attempts are reached.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSecurityChange('enableAccountLockout', !security.enableAccountLockout)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.enableAccountLockout ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.enableAccountLockout ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Data & Content Protection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Data & Content Protection</h2>
              </div>

              <div className="space-y-6">
                {/* Enforce HTTPS */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Enforce HTTPS for All Connections</label>
                    <p className="text-sm text-gray-500">All data transfers are encrypted (HTTPS).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSecurityChange('enforceHttps', !security.enforceHttps)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.enforceHttps ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.enforceHttps ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Content Retention Policy */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Content Retention Policy</label>
                  <p className="text-sm text-gray-500 mb-3">Automatically delete old creator content after this period (if not active).</p>
                  <select
                    value={security.contentRetentionPolicy}
                    onChange={(e) => handleSecurityChange('contentRetentionPolicy', e.target.value)}
                    className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                    <option value="365">365 Days</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                {/* Enable Automated Content Scanning */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Enable Automated Content Scanning</label>
                    <p className="text-sm text-gray-500">Use AI to detect and flag inappropriate content automatically.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSecurityChange('enableAutomatedContentScanning', !security.enableAutomatedContentScanning)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.enableAutomatedContentScanning ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.enableAutomatedContentScanning ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* System Maintenance (High Impact Actions) */}
            <div className="bg-white rounded-xl border-2 border-red-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-orange-600">System Maintenance (High Impact Actions)</h2>
              </div>
              <p className="text-gray-600 mb-6 ml-11">These actions can significantly impact platform performance and user access. Proceed with caution.</p>

              <div className="space-y-6">
                {/* Clear All Platform Cache */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Clear All Platform Cache</label>
                    <p className="text-sm text-gray-500">Clear all cached data across the platform. May temporarily impact performance.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Cache Now
                  </button>
                </div>

                {/* Put Platform in Maintenance Mode */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Put Platform in Maintenance Mode</label>
                    <p className="text-sm text-gray-500">Temporarily disable public access to the platform for maintenance.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Activate Maintenance Mode
                  </button>
                </div>

                {/* Backup Database Now */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Backup Database Now</label>
                    <p className="text-sm text-gray-500">Initiate an immediate, manual backup of the entire platform database.</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    Run Manual DB Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-8 right-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800">You have unsaved changes</span>
            </div>
          </div>
        )}
    </div>
  );
}
