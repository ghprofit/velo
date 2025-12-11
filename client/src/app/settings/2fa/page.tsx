'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api-client';
import Image from 'next/image';
import { Button } from '@/components/ui';

interface TwoFactorStatus {
  enabled: boolean;
  hasSecret: boolean;
}

interface SetupData {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export default function TwoFactorAuthPage() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      const response = await authApi.get2FAStatus();
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
      setError('Failed to load 2FA status');
    }
  };

  const handleSetup2FA = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authApi.setup2FA();
      const data = response.data.data;

      setSetupData({
        secret: data.secret,
        qrCode: data.qrCode,
        manualEntryKey: data.manualEntryKey,
      });
      setShowSetup(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!setupData) {
      setError('No setup data available');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.enable2FA(setupData.secret, verificationCode);
      const data = response.data.data;

      setBackupCodes(data.backupCodes);
      setSuccess('2FA enabled successfully! Save your backup codes.');
      setShowSetup(false);
      setVerificationCode('');
      await load2FAStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.disable2FA(disableCode);
      setSuccess('2FA disabled successfully');
      setDisableCode('');
      await load2FAStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const token = prompt('Enter your 2FA code to regenerate backup codes:');
    if (!token) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authApi.regenerateBackupCodes(token);
      setBackupCodes(response.data.data.backupCodes);
      setSuccess('Backup codes regenerated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'velolink-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    setSuccess('Backup codes copied to clipboard!');
  };

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Two-Factor Authentication
          </h1>
          <p className="text-lg text-gray-600">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600 font-medium">{success}</p>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status.enabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {status.enabled ? 'Enabled' : 'Disabled'}
            </span>
            {status.enabled && (
              <p className="text-gray-600">
                Two-factor authentication is currently active on your account.
              </p>
            )}
          </div>
        </div>

        {/* Enable 2FA */}
        {!status.enabled && !showSetup && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Enable Two-Factor Authentication
            </h2>
            <p className="text-gray-600 mb-6">
              Protect your account with TOTP-based two-factor authentication using apps like Google
              Authenticator, Authy, or 1Password.
            </p>
            <Button
              onClick={handleSetup2FA}
              disabled={loading}
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Setting up...' : 'Setup 2FA'}
            </Button>
          </div>
        )}

        {/* Setup Process */}
        {showSetup && setupData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Setup Two-Factor Authentication
            </h2>

            {/* Step 1: Scan QR Code */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Step 1: Scan QR Code
              </h3>
              <p className="text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center p-6 bg-gray-50 rounded-xl">
                <Image
                  src={setupData.qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                />
              </div>
            </div>

            {/* Step 2: Manual Entry */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Step 2: Manual Entry (Optional)
              </h3>
              <p className="text-gray-600 mb-4">
                If you can't scan the QR code, enter this key manually:
              </p>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <code className="flex-1 font-mono text-sm text-gray-900">
                  {setupData.manualEntryKey}
                </code>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(setupData.manualEntryKey);
                    setSuccess('Key copied to clipboard!');
                  }}
                  variant="secondary"
                  className="shrink-0"
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Step 3: Verify Code */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Step 3: Verify Code
              </h3>
              <p className="text-gray-600 mb-4">
                Enter the 6-digit code from your authenticator app to verify:
              </p>
              <form onSubmit={handleEnable2FA} className="space-y-4">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  autoComplete="off"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                />
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    variant="primary"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowSetup(false);
                      setSetupData(null);
                      setVerificationCode('');
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Backup Codes */}
        {backupCodes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Backup Codes</h2>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
              <p className="text-sm text-yellow-800">
                Save these backup codes in a secure location. Each code can only be used once.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center"
                >
                  <code className="font-mono text-base font-semibold text-gray-900">{code}</code>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={copyBackupCodes} variant="secondary">
                Copy Codes
              </Button>
              <Button onClick={downloadBackupCodes} variant="secondary">
                Download Codes
              </Button>
              <Button
                onClick={() => setBackupCodes([])}
                variant="secondary"
              >
                I've Saved Them
              </Button>
            </div>
          </div>
        )}

        {/* Disable 2FA */}
        {status.enabled && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Disable Two-Factor Authentication
            </h2>
            <p className="text-gray-600 mb-6">
              Disabling 2FA will make your account less secure. Enter your current 2FA code to
              disable.
            </p>
            <form onSubmit={handleDisable2FA} className="space-y-4">
              <input
                type="text"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="Enter 2FA code"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-center text-xl tracking-widest font-mono"
              />
              <Button
                type="submit"
                disabled={loading || disableCode.length !== 6}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            </form>
          </div>
        )}

        {/* Regenerate Backup Codes */}
        {status.enabled && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Regenerate Backup Codes
            </h2>
            <p className="text-gray-600 mb-6">
              Generate new backup codes. This will invalidate all existing backup codes.
            </p>
            <Button
              onClick={handleRegenerateBackupCodes}
              disabled={loading}
              variant="secondary"
            >
              Regenerate Backup Codes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
