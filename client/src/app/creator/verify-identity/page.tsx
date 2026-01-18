'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { veriffApi } from '@/lib/api-client';
import { useAppSelector } from '../../redux';
import type { VeriffSessionResponse } from '@/types/auth';

type VerificationStatusType = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export default function CreatorVerifyIdentityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationSession, setVerificationSession] = useState<VeriffSessionResponse | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusType>('PENDING');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);

  // Check current verification status on mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await veriffApi.getMyVerificationStatus();
      const data = response.data.data;

      setVerificationStatus(data.verificationStatus);
      setSessionId(data.veriffSessionId);
    } catch (err: unknown) {
      console.error('Failed to fetch verification status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleInitiateVerification = async () => {
    if (!user) {
      setError('User not found. Please log in again.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await veriffApi.initiateVerification();
      const sessionData = response.data.data;

      setVerificationSession(sessionData);
      setSessionId(sessionData.sessionId);
      setVerificationStatus('IN_PROGRESS');

      // Open Veriff verification in new window
      if (sessionData.verificationUrl) {
        window.open(sessionData.verificationUrl, '_blank');
      }
    } catch (err: unknown) {
      console.error('Verification initiation error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to initiate verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubmit = async () => {
    if (!sessionId) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await veriffApi.resubmitVerification(sessionId);
      const sessionData = response.data.data;

      setVerificationSession(sessionData);

      if (sessionData.verificationUrl) {
        window.open(sessionData.verificationUrl, '_blank');
      }
    } catch (err: unknown) {
      console.error('Resubmission error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to resubmit verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    const badges = {
      PENDING: { color: 'bg-gray-100 text-gray-800', text: 'Not Started', icon: '⏸️' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', text: 'In Progress', icon: '🔄' },
      VERIFIED: { color: 'bg-green-100 text-green-800', text: 'Verified', icon: '✅' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Rejected', icon: '❌' },
      EXPIRED: { color: 'bg-yellow-100 text-yellow-800', text: 'Expired', icon: '⏱️' },
    };

    const badge = badges[verificationStatus] || badges.PENDING;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${badge.color}`}>
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Identity Verification
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-gray-600">Status:</span>
              {getStatusBadge()}
            </div>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Verify your identity to unlock all creator features and receive payments.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Verification Success */}
          {verificationSession && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-600 font-medium">
                Verification window opened! Complete the verification process in the new tab.
              </p>
            </div>
          )}

          {/* Status-specific content */}
          {verificationStatus === 'VERIFIED' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verified!</h2>
              <p className="text-gray-700 mb-6">
                Your identity has been successfully verified. You now have full access to all creator features.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/creator')}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : verificationStatus === 'REJECTED' ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">❌</span>
                Verification Declined
              </h2>
              <p className="text-gray-700 mb-6">
                Unfortunately, your identity verification was declined. This could be due to unclear photos, document issues, or mismatched information. You can resubmit your verification with updated information.
              </p>
              <Button
                variant="primary"
                onClick={handleResubmit}
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Starting...' : 'Resubmit Verification'}
              </Button>
            </div>
          ) : verificationStatus === 'IN_PROGRESS' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                Verification In Progress
              </h2>
              <p className="text-gray-700 mb-6">
                Your identity verification is being reviewed. This usually takes a few minutes, but can take up to 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={checkVerificationStatus}
                  className="w-full sm:w-auto"
                >
                  Check Status
                </Button>
                {verificationSession ? (
                  <Button
                    variant="outline"
                    onClick={() => window.open(verificationSession.verificationUrl, '_blank')}
                    className="w-full sm:w-auto"
                  >
                    View Details
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={sessionId ? handleResubmit : handleInitiateVerification}
                    isLoading={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? 'Loading...' : 'View Details'}
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Need help? <a href="/support" className="text-indigo-600 hover:text-indigo-700 underline">Contact our support team</a>
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* What you'll need */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  What you&apos;ll need:
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Government ID</h3>
                    <p className="text-sm text-gray-600">Passport, driver&apos;s license, or national ID</p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Camera</h3>
                    <p className="text-sm text-gray-600">Webcam or smartphone camera</p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">3-5 Minutes</h3>
                    <p className="text-sm text-gray-600">Quick and easy verification process</p>
                  </div>
                </div>
              </div>

              {/* Benefits of verification */}
              <div className="bg-indigo-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Why verify your identity?
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Receive payments and withdraw earnings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Build trust with your audience with a verified badge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Access premium features and higher upload limits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl">✓</span>
                    <span className="text-gray-700">Protect your account and content</span>
                  </li>
                </ul>
              </div>

              {/* Privacy notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Your privacy is protected</p>
                  <p>We use Veriff, a trusted third-party service. Your data is encrypted and only used for identity verification.</p>
                </div>
              </div>

              {/* Action button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={handleInitiateVerification}
                  isLoading={isLoading}
                  className="text-base py-3.5 sm:w-auto sm:px-8"
                >
                  {isLoading ? 'Starting verification...' : 'Start Verification Now'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/creator')}
                  className="text-base py-3.5 sm:w-auto sm:px-8"
                >
                  Do This Later
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
