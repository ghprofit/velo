'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api-client';
import { useAppSelector } from '../../redux';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Store 6-digit code as array of strings
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { user } = useAppSelector((state) => state.auth);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await authApi.verifyEmail(verificationCode);
      setSuccess('Email verified successfully!');

      // Navigate to identity verification after 1 second
      setTimeout(() => {
        router.push('/register/verify-identity');
      }, 1000);
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!user?.email) {
      setError('Email address not found. Please log in again.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      await authApi.resendVerification(user.email);
      setSuccess('A new verification code has been sent to your email!');
      // Clear the code inputs
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-8" />
          </div>

          {/* Mobile: Simplified Step Indicator (Dots) */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
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
              <div className="w-15 h-0.5 bg-indigo-600"></div>

              {/* Step 2 - Email Verification (Current) */}
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                2
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-gray-300"></div>

              {/* Step 3 - KYC */}
              <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-semibold text-lg">
                3
              </div>

              {/* Line */}
              <div className="w-15 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Payout */}
              <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-semibold text-lg">
                4
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-10">
            Step 2 of 4: Email Verification
          </p>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Title */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Verify Your Email
              </h1>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                We've sent a 6-digit verification code to <strong>{user?.email}</strong>. Please enter the code below.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium text-center">{success}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            {/* Verification Code Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || code.some(d => !d)}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            {/* Resend Code */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>

            {/* Info Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">
                    The verification code will expire in 24 hours. If you don't see the email, check your spam or junk folder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
