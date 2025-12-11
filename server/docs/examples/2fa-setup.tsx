// app/settings/2fa/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api-client';
import Image from 'next/image';

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
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Two-Factor Authentication</h1>
      <p>
        Add an extra layer of security to your account by enabling two-factor
        authentication.
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* 2FA Status */}
      <div className="status-card">
        <h2>Status</h2>
        <div className="status-indicator">
          <span className={`badge ${status.enabled ? 'enabled' : 'disabled'}`}>
            {status.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {status.enabled && (
          <p className="status-text">
            Two-factor authentication is currently active on your account.
          </p>
        )}
      </div>

      {/* Enable 2FA */}
      {!status.enabled && !showSetup && (
        <div className="action-card">
          <h2>Enable Two-Factor Authentication</h2>
          <p>
            Protect your account with TOTP-based two-factor authentication using
            apps like Google Authenticator, Authy, or 1Password.
          </p>
          <button
            onClick={handleSetup2FA}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Setting up...' : 'Setup 2FA'}
          </button>
        </div>
      )}

      {/* Setup Process */}
      {showSetup && setupData && (
        <div className="setup-card">
          <h2>Setup Two-Factor Authentication</h2>

          <div className="setup-step">
            <h3>Step 1: Scan QR Code</h3>
            <p>
              Scan this QR code with your authenticator app (Google Authenticator,
              Authy, etc.)
            </p>
            <div className="qr-code">
              <Image
                src={setupData.qrCode}
                alt="2FA QR Code"
                width={200}
                height={200}
              />
            </div>
          </div>

          <div className="setup-step">
            <h3>Step 2: Manual Entry (Optional)</h3>
            <p>If you can't scan the QR code, enter this key manually:</p>
            <div className="manual-key">
              <code>{setupData.manualEntryKey}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(setupData.manualEntryKey);
                  setSuccess('Key copied to clipboard!');
                }}
                className="btn-secondary"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="setup-step">
            <h3>Step 3: Verify Code</h3>
            <p>Enter the 6-digit code from your authenticator app to verify:</p>
            <form onSubmit={handleEnable2FA}>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                autoComplete="off"
              />
              <div className="button-group">
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="btn-primary"
                >
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSetup(false);
                    setSetupData(null);
                    setVerificationCode('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backup Codes */}
      {backupCodes.length > 0 && (
        <div className="backup-codes-card">
          <h2>Backup Codes</h2>
          <p className="warning">
            Save these backup codes in a secure location. Each code can only be
            used once.
          </p>

          <div className="codes-grid">
            {backupCodes.map((code, index) => (
              <div key={index} className="code">
                <code>{code}</code>
              </div>
            ))}
          </div>

          <div className="button-group">
            <button onClick={copyBackupCodes} className="btn-secondary">
              Copy Codes
            </button>
            <button onClick={downloadBackupCodes} className="btn-secondary">
              Download Codes
            </button>
            <button
              onClick={() => setBackupCodes([])}
              className="btn-secondary"
            >
              I've Saved Them
            </button>
          </div>
        </div>
      )}

      {/* Disable 2FA */}
      {status.enabled && (
        <div className="danger-card">
          <h2>Disable Two-Factor Authentication</h2>
          <p>
            Disabling 2FA will make your account less secure. Enter your current
            2FA code to disable.
          </p>
          <form onSubmit={handleDisable2FA}>
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              placeholder="Enter 2FA code"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
            <button
              type="submit"
              disabled={loading || disableCode.length !== 6}
              className="btn-danger"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </form>
        </div>
      )}

      {/* Regenerate Backup Codes */}
      {status.enabled && (
        <div className="action-card">
          <h2>Regenerate Backup Codes</h2>
          <p>
            Generate new backup codes. This will invalidate all existing backup
            codes.
          </p>
          <button
            onClick={handleRegenerateBackupCodes}
            disabled={loading}
            className="btn-secondary"
          >
            Regenerate Backup Codes
          </button>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        h2 {
          font-size: 20px;
          margin-bottom: 12px;
        }

        h3 {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .success-message {
          background: #c6f6d5;
          color: #2f855a;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .status-card,
        .action-card,
        .setup-card,
        .backup-codes-card,
        .danger-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .danger-card {
          border-color: #fc8181;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .badge.enabled {
          background: #c6f6d5;
          color: #2f855a;
        }

        .badge.disabled {
          background: #fed7d7;
          color: #c53030;
        }

        .qr-code {
          display: flex;
          justify-content: center;
          margin: 20px 0;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .manual-key {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
          margin: 12px 0;
        }

        .manual-key code {
          flex: 1;
          font-family: monospace;
          font-size: 14px;
        }

        .setup-step {
          margin-bottom: 32px;
        }

        input[type='text'] {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .button-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary,
        .btn-secondary,
        .btn-danger {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5568d3;
        }

        .btn-secondary {
          background: #edf2f7;
          color: #2d3748;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .btn-danger {
          background: #fc8181;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #f56565;
        }

        .btn-primary:disabled,
        .btn-secondary:disabled,
        .btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .codes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }

        .code {
          padding: 12px;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
        }

        .code code {
          font-family: monospace;
          font-size: 16px;
          font-weight: 600;
        }

        .warning {
          background: #fef5e7;
          color: #d69e2e;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
