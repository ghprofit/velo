'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { veriffApi } from '@/lib/api-client';
import { useAppSelector } from '../../redux';
import type { VeriffSessionResponse } from '@/types/auth';
import Image from 'next/image';
import FloatingLogo from '@/components/FloatingLogo';

export default function VerifyIdentityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSession, setVerificationSession] = useState<VeriffSessionResponse | null>(null);

  const { user } = useAppSelector((state) => state.auth);

  const handleInitiateVerification = async () => {
    if (!user) {
      setError('User not found. Please log in again.');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Open window IMMEDIATELY (before async call) to avoid iOS popup blocker
    const verificationWindow = window.open('about:blank', '_blank');
    if (!verificationWindow) {
      setError('Please allow popups for this site to complete verification.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await veriffApi.initiateVerification();
      const sessionData = response.data.data;

      setVerificationSession(sessionData);

      // Update the already-opened window with the verification URL
      if (sessionData.verificationUrl) {
        verificationWindow.location.href = sessionData.verificationUrl;
      } else {
        verificationWindow.close();
        setError('No verification URL received.');
      }
    } catch (err: unknown) {
      console.error('Verification initiation error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to initiate verification. Please try again.');
      verificationWindow.close();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to payout setup (step 3)
    router.push('/register/payout-setup');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 relative">
      {/* Floating Brand Logo */}
      <FloatingLogo
        position="top-left"
        size={85}
        animation="rotate"
        opacity={0.07}
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" width={120} height={32} className="h-8" />
          </div>

          {/* Mobile: Simplified Step Indicator (Dots) */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>

          {/* Desktop: Full Step Indicator */}
          <div className="hidden md:flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              {/* Step 1 - Registration (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                ✓
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-green-500"></div>

              {/* Step 2 - Email Verification (Completed) */}
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg">
                ✓
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-indigo-600"></div>

              {/* Step 3 - KYC Verification (Current) */}
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                3
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Payout Setup (Pending) */}
              <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-semibold text-lg">
                4
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-10">
            Step 3 of 4: Identity Verification
          </p>

          {/* Main Content */}
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Title and Description */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Verify Your Identity
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                To ensure the security of our platform and comply with regulations, we need to verify your identity. This is a one-time process that takes just a few minutes.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Verification Success */}
            {verificationSession && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">
                  Verification session created! The verification window has been opened in a new tab.
                </p>
              </div>
            )}

            {/* What you'll need */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                What you&apos;ll need:
              </h2>

              <div className="space-y-3">
                {/* Government ID */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Government-issued ID</span>
                    <p className="text-gray-700 text-sm mt-1">Valid passport, driver&apos;s license, or national ID card</p>
                  </div>
                </div>

                {/* Camera/Webcam */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Camera or webcam</span>
                    <p className="text-gray-700 text-sm mt-1">To take a photo of your ID and a selfie for verification</p>
                  </div>
                </div>

                {/* Few minutes */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">3-5 minutes of your time</span>
                    <p className="text-gray-700 text-sm mt-1">The verification process is quick and straightforward</p>
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mt-4">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Your privacy is protected</p>
                  <p>We use Veriff, a trusted third-party verification service. Your data is encrypted and secure. We only use this information to verify your identity and comply with legal requirements.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                {!verificationSession ? (
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={handleInitiateVerification}
                    isLoading={isLoading}
                    className="text-base py-3.5"
                  >
                    {isLoading ? 'Starting verification...' : 'Start Verification'}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      onClick={() => window.open(verificationSession.verificationUrl, '_blank')}
                      className="text-base py-3.5"
                    >
                      Reopen Verification Window
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={handleContinue}
                      className="text-base py-3.5"
                    >
                      I&apos;ll Complete This Later
                    </Button>
                  </div>
                )}

                <div className="text-center space-y-2">
                  <Link
                    href="/register/payout-setup"
                    className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Skip for now (verify later)
                  </Link>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="border-t pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">How it works:</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Click &quot;Start Verification&quot; to open a secure verification window</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Follow the instructions to photograph your ID and take a selfie</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Wait for verification (usually completes within a few minutes)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>You&apos;ll receive an email notification once your identity is verified</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
