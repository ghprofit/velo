'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, payoutApi } from '@/lib/api-client';
import FloatingLogo from '@/components/FloatingLogo';

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
}

interface BankAccount {
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankCountry: string;
  bankCurrency: string;
  payoutSetupCompleted: boolean;
}

interface NotificationPreferences {
  notifyPayoutUpdates: boolean;
  notifyContentEngagement: boolean;
  notifyPlatformAnnouncements: boolean;
  notifyMarketingEmails: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settingsTab, setSettingsTab] = useState('Profile Info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  // Bank account state
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [bankFormData, setBankFormData] = useState({
    bankAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankSwiftCode: '',
    bankIban: '',
    bankCountry: '',
    bankCurrency: 'USD',
  });
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    notifyPayoutUpdates: true,
    notifyContentEngagement: true,
    notifyPlatformAnnouncements: true,
    notifyMarketingEmails: false,
  });

  // Danger zone state
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const settingsTabs = ['Profile Info', 'Payouts', 'Security', 'Email Preferences', 'Danger Zone'];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load profile
      const profileRes = await authApi.getProfile();
      const userData = profileRes.data.data;
      setProfile(userData);
      setDisplayName(userData.displayName || '');
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email || '');

      // Load bank account
      try {
        const bankRes = await payoutApi.getBankAccountInfo();
        setBankAccount(bankRes.data.data);
      } catch  {
        // Bank account might not be set up yet
        console.log('No bank account found');
      }

      // Load notification preferences
      const notifRes = await authApi.getNotificationPreferences();
      setNotifications(notifRes.data.data);

    } catch (err: unknown) {
      console.error('Error loading user data:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await authApi.updateProfile({
        displayName,
        firstName,
        lastName,
        email,
      });

      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
      await loadUserData();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (profile) {
      setDisplayName(profile.displayName || '');
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
    }
    setIsEditingProfile(false);
    setError('');
  };

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      setResendingVerification(true);
      setVerificationMessage('');
      await authApi.resendVerification(email);
      setVerificationMessage('Verification code sent! Please check your email.');
      setTimeout(() => setVerificationMessage(''), 5000);
    } catch (err: unknown) {
      setVerificationMessage((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to resend verification code. Please try again.');
      setTimeout(() => setVerificationMessage(''), 5000);
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (bankFormData.bankAccountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match');
      setSaving(false);
      return;
    }

    try {
      const payload: {
        bankAccountName: string;
        bankName: string;
        bankAccountNumber: string;
        bankCountry: string;
        bankCurrency: string;
        bankRoutingNumber?: string;
        bankSwiftCode?: string;
        bankIban?: string;
      } = {
        bankAccountName: bankFormData.bankAccountName,
        bankName: bankFormData.bankName,
        bankAccountNumber: bankFormData.bankAccountNumber,
        bankCountry: bankFormData.bankCountry,
        bankCurrency: bankFormData.bankCurrency,
      };

      if (bankFormData.bankRoutingNumber) payload.bankRoutingNumber = bankFormData.bankRoutingNumber;
      if (bankFormData.bankSwiftCode) payload.bankSwiftCode = bankFormData.bankSwiftCode;
      if (bankFormData.bankIban) payload.bankIban = bankFormData.bankIban;

      await payoutApi.setupBankAccount(payload);

      setSuccess('Bank account updated successfully!');
      setBankFormData({
        bankAccountName: '',
        bankName: '',
        bankAccountNumber: '',
        bankRoutingNumber: '',
        bankSwiftCode: '',
        bankIban: '',
        bankCountry: '',
        bankCurrency: 'USD',
      });
      setConfirmAccountNumber('');
      await loadUserData();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await authApi.updateNotificationPreferences({
        payoutUpdates: notifications.notifyPayoutUpdates,
        contentEngagement: notifications.notifyContentEngagement,
        platformAnnouncements: notifications.notifyPlatformAnnouncements,
        marketingEmails: notifications.notifyMarketingEmails,
      });

      setSuccess('Notification preferences updated!');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await authApi.deactivateAccount(deactivatePassword);

      // Logout and redirect
      localStorage.clear();
      router.push('/login');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to deactivate account');
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    if (!confirm('This action is PERMANENT and IRREVERSIBLE. Are you absolutely sure you want to delete your account?')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await authApi.deleteAccount(deletePassword, deleteConfirmation);

      // Logout and redirect
      localStorage.clear();
      router.push('/login');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete account');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Account Settings</h1>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 relative">
          {/* Floating Brand Logo */}
          <FloatingLogo
            position="center"
            size={80}
            animation="pulse"
            opacity={0.05}
            zIndex={-1}
          />

          {/* Settings Tabs */}
          <div className="border-b border-gray-200 mb-6 sm:mb-8 -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide pb-px">
              {settingsTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setSettingsTab(tab);
                    setError('');
                    setSuccess('');
                  }}
                  className={`tab-3d pb-3 sm:pb-4 px-4 sm:px-6 border-b-2 text-sm sm:text-base font-medium whitespace-nowrap rounded-t-xl ${
                    settingsTab === tab
                      ? 'active border-indigo-600 text-indigo-600'
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

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Profile Info Tab */}
          {settingsTab === 'Profile Info' && (
            <div className="max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6 sm:space-y-8">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-900 mb-2">
                    Display Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                    />
                  ) : (
                    <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base">
                      {displayName || 'Not set'}
                    </div>
                  )}
                </div>

                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                      First Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    ) : (
                      <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base">
                        {firstName || 'Not set'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                      Last Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    ) : (
                      <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base">
                        {lastName || 'Not set'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Address - Always Read-only */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-24 sm:pr-28 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm sm:text-base truncate">
                      {email}
                    </div>
                    {profile?.emailVerified && (
                      <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Email Not Verified Warning */}
                  {!profile?.emailVerified && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-800 mb-1">
                            Email Not Verified
                          </p>
                          <p className="text-sm text-yellow-700 mb-3">
                            Verify your email to upload content and receive payments. Check your inbox for the verification code.
                          </p>
                          {verificationMessage && (
                            <p className={`text-sm mb-3 ${verificationMessage.includes('sent') ? 'text-green-700' : 'text-red-700'}`}>
                              {verificationMessage}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={handleResendVerification}
                              disabled={resendingVerification}
                              className="px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {resendingVerification ? 'Sending...' : 'Resend Verification Code'}
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push('/register/verify')}
                              className="px-4 py-2 border border-yellow-600 text-yellow-700 text-sm font-semibold rounded-lg hover:bg-yellow-50 transition-colors"
                            >
                              Enter Verification Code
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditingProfile && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Payouts Tab */}
          {settingsTab === 'Payouts' && (
            <div className="max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Payouts</h2>
                  <p className="text-sm sm:text-base text-gray-600">Manage your primary payout method and financial details securely.</p>
                </div>
                {bankAccount?.payoutSetupCompleted && (
                  <span className="self-start px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap">
                    Payout Status: Verified
                  </span>
                )}
              </div>

              {/* Current Bank Account */}
              {bankAccount && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Current Bank Account</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">Account Holder</p>
                      <p className="font-semibold text-sm sm:text-base">{bankAccount.bankAccountName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">Bank Name</p>
                      <p className="font-semibold text-sm sm:text-base">{bankAccount.bankName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">Account Number</p>
                      <p className="font-semibold text-sm sm:text-base">{bankAccount.bankAccountNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">Country</p>
                      <p className="font-semibold text-sm sm:text-base">{bankAccount.bankCountry}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Form */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                  {bankAccount ? 'Update Bank Account' : 'Add Bank Account'}
                </h3>

                <form onSubmit={handleSaveBankAccount} className="space-y-4 sm:space-y-6">
                  {/* Country */}
                  <div>
                    <label htmlFor="bankCountry" className="block text-sm font-medium text-gray-900 mb-2">
                      Country of Bank Account <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="bankCountry"
                      value={bankFormData.bankCountry}
                      onChange={(e) => setBankFormData({ ...bankFormData, bankCountry: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                    >
                      <option value="">Select your country</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="ES">Spain</option>
                      <option value="IT">Italy</option>
                      <option value="NL">Netherlands</option>
                      <option value="AU">Australia</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Account Holder Name */}
                  <div>
                    <label htmlFor="bankAccountName" className="block text-sm font-medium text-gray-900 mb-2">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bankAccountName"
                      type="text"
                      value={bankFormData.bankAccountName}
                      onChange={(e) => setBankFormData({ ...bankFormData, bankAccountName: e.target.value })}
                      required
                      placeholder="Must match your KYC verified name"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-900 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bankName"
                      type="text"
                      value={bankFormData.bankName}
                      onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                      required
                      placeholder="Enter your bank name"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* Routing Number (US/GB) */}
                  {(bankFormData.bankCountry === 'US' || bankFormData.bankCountry === 'GB') && (
                    <div>
                      <label htmlFor="bankRoutingNumber" className="block text-sm font-medium text-gray-900 mb-2">
                        Routing/Sort Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="bankRoutingNumber"
                        type="text"
                        value={bankFormData.bankRoutingNumber}
                        onChange={(e) => setBankFormData({ ...bankFormData, bankRoutingNumber: e.target.value })}
                        required
                        placeholder={bankFormData.bankCountry === 'US' ? '9-digit routing number' : '8-digit sort code'}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                  )}

                  {/* Account Number */}
                  <div>
                    <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-900 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="bankAccountNumber"
                      type="text"
                      value={bankFormData.bankAccountNumber}
                      onChange={(e) => setBankFormData({ ...bankFormData, bankAccountNumber: e.target.value })}
                      required
                      placeholder="Enter your account number"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* Confirm Account Number */}
                  <div>
                    <label htmlFor="confirmAccountNumber" className="block text-sm font-medium text-gray-900 mb-2">
                      Confirm Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="confirmAccountNumber"
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      required
                      placeholder="Re-enter your account number"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* SWIFT (International) */}
                  {bankFormData.bankCountry && bankFormData.bankCountry !== 'US' && (
                    <div>
                      <label htmlFor="bankSwiftCode" className="block text-sm font-medium text-gray-900 mb-2">
                        SWIFT/BIC Code
                      </label>
                      <input
                        id="bankSwiftCode"
                        type="text"
                        value={bankFormData.bankSwiftCode}
                        onChange={(e) => setBankFormData({ ...bankFormData, bankSwiftCode: e.target.value })}
                        placeholder="Optional for international transfers"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                  )}

                  {/* IBAN (European) */}
                  {['DE', 'FR', 'ES', 'IT', 'NL', 'GB'].includes(bankFormData.bankCountry) && (
                    <div>
                      <label htmlFor="bankIban" className="block text-sm font-medium text-gray-900 mb-2">
                        IBAN
                      </label>
                      <input
                        id="bankIban"
                        type="text"
                        value={bankFormData.bankIban}
                        onChange={(e) => setBankFormData({ ...bankFormData, bankIban: e.target.value })}
                        placeholder="Optional - International Bank Account Number"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {saving ? 'Saving...' : 'Update Payout Details'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {settingsTab === 'Security' && (
            <div className="max-w-5xl">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Account Security</h2>
                <p className="text-sm sm:text-base text-gray-600">Protect your account with a strong password and two-factor authentication.</p>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Change Your Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-900 mb-2">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        placeholder="Enter current password"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900 mb-2">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        placeholder="Enter new password"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-900 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmNewPassword"
                        type="password"
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        required
                        placeholder="Confirm new password"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* 2FA Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Add an extra layer of security by requiring a code from your mobile device when logging in.
                  </p>
                </div>
                <Link
                  href="/settings/2fa"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  Manage 2FA
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Sessions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Active Sessions</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Review devices and locations that have recently accessed your account.
                  </p>
                </div>
                <Link
                  href="/settings/sessions"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  View All Sessions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Email Preferences Tab */}
          {settingsTab === 'Email Preferences' && (
            <div className="max-w-5xl">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Email Preferences</h2>
                <p className="text-sm sm:text-base text-gray-600">Control which email notifications you receive from VELO.</p>
              </div>

              {/* Earning & Engagement */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Earning & Engagement Updates</h3>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1">Payout updates</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Receive alerts when payouts are processed or there&apos;s a payment issue.</p>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          setNotifications({ ...notifications, notifyPayoutUpdates: !notifications.notifyPayoutUpdates });
                          handleUpdateNotifications();
                        }}
                        className={`w-11 sm:w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                          notifications.notifyPayoutUpdates ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            notifications.notifyPayoutUpdates ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1">New content engagement</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Receive alerts when your content is unlocked or there is a purchase.</p>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          setNotifications({ ...notifications, notifyContentEngagement: !notifications.notifyContentEngagement });
                          handleUpdateNotifications();
                        }}
                        className={`w-11 sm:w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                          notifications.notifyContentEngagement ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            notifications.notifyContentEngagement ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform & Marketing */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Platform & Marketing</h3>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1">Platform announcements</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Important information regarding system updates, new features, or terms changes.</p>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          setNotifications({ ...notifications, notifyPlatformAnnouncements: !notifications.notifyPlatformAnnouncements });
                          handleUpdateNotifications();
                        }}
                        className={`w-11 sm:w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                          notifications.notifyPlatformAnnouncements ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            notifications.notifyPlatformAnnouncements ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1">Marketing emails</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Opt-in to promotional or marketing communications.</p>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          setNotifications({ ...notifications, notifyMarketingEmails: !notifications.notifyMarketingEmails });
                          handleUpdateNotifications();
                        }}
                        className={`w-11 sm:w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                          notifications.notifyMarketingEmails ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            notifications.notifyMarketingEmails ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-save notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs sm:text-sm text-blue-900">
                  <strong>Auto-save enabled:</strong> Your email preferences are automatically saved when you make changes.
                </p>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {settingsTab === 'Danger Zone' && (
            <div className="max-w-5xl">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-3 sm:mb-4">Danger Zone</h2>
                <div className="flex items-start gap-2 sm:gap-3 border-l-4 border-red-600 pl-3 sm:pl-4 py-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">Proceed with Extreme Caution</h3>
                    <p className="text-xs sm:text-sm text-gray-700">
                      These actions are irreversible and may result in the loss of data and access to your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deactivate Account */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Deactivate Account (Temporary)</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Temporarily hide your content and profile. You can reactivate by logging in again.
                </p>

                <div className="space-y-3 sm:space-y-4">
                  <input
                    type="password"
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm sm:text-base"
                  />
                  <button
                    onClick={handleDeactivateAccount}
                    disabled={!deactivatePassword || saving}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {saving ? 'Deactivating...' : 'Deactivate Account'}
                  </button>
                </div>
              </div>

              {/* Delete Account */}
              <div className="bg-white rounded-xl border-2 border-red-500 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-red-600 mb-1 sm:mb-2">Delete Account Permanently</h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                  <strong>This action is final and cannot be undone.</strong> All data will be permanently deleted.
                </p>

                <div className="bg-red-50 border-l-4 border-red-600 p-3 sm:p-4 mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-red-900">
                    Before deleting, ensure your payout balance is empty and all pending transactions are complete.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder='Type "DELETE MY ACCOUNT" to confirm'
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || deleteConfirmation !== 'DELETE MY ACCOUNT' || saving}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {saving ? 'Deleting...' : 'Delete Account Permanently'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    </>
  );
}
