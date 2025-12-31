'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api-client';
import type { Session } from '@/types/auth';
import { Button } from '@/components/ui';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authApi.getSessions();
      setSessions(response.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    setError('');
    setSuccess('');

    try {
      await authApi.revokeSession(sessionId);
      setSuccess('Session revoked successfully');
      await loadSessions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm('Are you sure you want to logout from all devices? This will end all active sessions except the current one.')) {
      return;
    }

    setRevokingAll(true);
    setError('');
    setSuccess('');

    try {
      await authApi.revokeAllSessions();
      setSuccess('All sessions revoked successfully. You will remain logged in on this device.');
      await loadSessions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to revoke all sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return '💻';
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return '📱';
    if (ua.includes('tablet') || ua.includes('ipad')) return '📱';
    return '💻';
  };

  const getBrowserName = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Browser';
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    return 'Unknown Browser';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Active Sessions</h1>
          <p className="text-lg text-gray-600">
            Manage your active sessions and see where you&apos;re logged in.
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

        {/* Revoke All Sessions */}
        {sessions.length > 1 && (
          <div className="mb-6 flex justify-end">
            <Button
              onClick={revokeAllSessions}
              disabled={revokingAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {revokingAll ? 'Revoking All...' : 'Logout from All Devices'}
            </Button>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No active sessions found.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Session Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Device Icon */}
                    <div className="text-4xl">
                      {getDeviceIcon(session.userAgent)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {/* Device Name / Browser */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {session.deviceName || getBrowserName(session.userAgent)}
                      </h3>

                      {/* User Agent */}
                      {session.userAgent && (
                        <p className="text-sm text-gray-600 mb-2 truncate">
                          {session.userAgent}
                        </p>
                      )}

                      {/* IP Address */}
                      {session.ipAddress && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">IP:</span>
                          <span className="text-sm text-gray-700">{session.ipAddress}</span>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {formatDate(session.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Last used:</span>{' '}
                          {formatDate(session.lastUsedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span>{' '}
                          {formatDate(session.expiresAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revoke Button */}
                  <Button
                    onClick={() => revokeSession(session.id)}
                    disabled={revokingId === session.id}
                    variant="secondary"
                    className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {revokingId === session.id ? 'Revoking...' : 'Revoke'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Revoking a session will log you out from that device. If you revoke the current session, you&apos;ll need to log in again.
          </p>
        </div>
      </div>
    </div>
  );
}
