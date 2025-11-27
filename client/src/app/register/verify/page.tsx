'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useInitiateVerificationMutation } from '@/state/api';
import { useAppSelector } from '../../redux';

export default function VerifyPage() {
  const router = useRouter();
  const [initiateVerification, { isLoading }] = useInitiateVerificationMutation();
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleStartVerification = async () => {
    setError(null);

    if (!isAuthenticated) {
      setError('Please log in to continue with verification.');
      return;
    }

    try {
      const response = await initiateVerification().unwrap();

      if (response.data?.verificationUrl) {
        // Redirect to Veriff's verification page
        window.location.href = response.data.verificationUrl;
      } else {
        setError('Unable to start verification. Please try again.');
      }
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError.data?.message || 'Failed to initiate verification. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo"/>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              {/* Step 1 - Profile (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                ✓
              </div>
              <span className="hidden text-sm font-medium text-gray-700">Profile</span>

              {/* Line */}
              <div className="w-15 h-0.5 bg-green-500"></div>

              {/* Step 2 - ID Verification (Current) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                2
              </div>
              <span className="hidden text-sm font-medium text-gray-900">ID Verification</span>

              {/* Line */}
              <div className="w-15 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Complete */}
              <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold text-lg">
                3
              </div>
              <span className="hidden text-sm font-medium text-gray-500">Complete</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-10">
            Step 2 of 3: ID Verification (KYC)
          </p>

          {/* Main Content */}
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Title and Description */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Secure Identity Verification
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                To ensure compliance with global financial regulations and process your creator payouts, we are required to verify your identity.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* What you need to know */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                What you need to know:
              </h2>

              <div className="space-y-3">
                {/* Requirement */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Requirement:</span>
                    <span className="text-gray-700 ml-1">Mandatory for all creators</span>
                  </div>
                </div>

                {/* Partner */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Partner:</span>
                    <span className="text-gray-700 ml-1">Verification powered by Veriff</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Time:</span>
                    <span className="text-gray-700 ml-1">Takes less than 5 minutes to complete</span>
                  </div>
                </div>

                {/* ID & Camera */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-700">Please have your Government ID and a clear camera ready</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-blue-900">
                  Your documents are handled securely and never stored by VELO.
                </p>
              </div>

              {/* Powered by Veriff */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>Powered by</span>
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                  <span className="font-bold text-gray-900">Veriff</span>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={handleStartVerification}
                  isLoading={isLoading}
                  className="text-base py-3.5 bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {isLoading ? 'Starting Verification...' : 'Start Verification (Via Veriff)'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>

                <div className="text-center">
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    I need more time. Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
