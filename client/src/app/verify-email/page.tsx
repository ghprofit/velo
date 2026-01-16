'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from '@/state/api';
import Image from 'next/image';
import FloatingLogo from '@/components/FloatingLogo';

export default function VerifyEmailPage() {
  const router = useRouter();

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setStatus('error');
      setMessage('Please enter a 6-digit verification code');
      return;
    }

    try {
      const response = await verifyEmail(code).unwrap();
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');

      // Redirect to ID verification after 3 seconds
      setTimeout(() => {
        router.push('/register/verify');
      }, 3000);
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      setStatus('error');
      setMessage(apiError.data?.message || 'Verification failed. Please check your code and try again.');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    // Clear error when user starts typing
    if (status === 'error') {
      setStatus('idle');
      setMessage('');
    }
  };

  const handleResendClick = () => {
    setShowEmailInput(true);
    setResendMessage('');
  };

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResendMessage('Please enter a valid email address');
      return;
    }

    try {
      await resendVerificationEmail({ email: email.toLowerCase() }).unwrap();
      setResendMessage('Verification code sent! Check your email.');
      setShowEmailInput(false);
      setEmail('');
      setResendCooldown(60); // Start 60 second cooldown
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      setResendMessage(apiError.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
      {/* Floating Brand Logo */}
      <FloatingLogo
        position="bottom-right"
        size={90}
        animation="float"
        opacity={0.08}
      />

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" width={120} height={40} />
          </div>

          {status !== 'success' ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                <p className="text-gray-600 mt-2">Enter the 6-digit code sent to your email</p>
              </div>

              {/* Code Input Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="000000"
                    className="w-full text-center text-3xl font-mono font-bold tracking-widest border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">Code expires in 20 minutes</p>
                </div>

                {/* Error Message */}
                {status === 'error' && message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 text-center">{message}</p>
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={code.length !== 6 || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </form>

              {/* Resend Code Section */}
              <div className="mt-6 space-y-3">
                {/* Success/Error Message for Resend */}
                {resendMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm text-center ${
                      resendMessage.includes('sent')
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}
                  >
                    {resendMessage}
                  </div>
                )}

                {/* Email Input Form (shown when user clicks resend) */}
                {showEmailInput && (
                  <form onSubmit={handleResendSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter your email to resend code
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        disabled={isResending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isResending ? 'Sending...' : 'Send Code'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setShowEmailInput(false);
                          setEmail('');
                          setResendMessage('');
                        }}
                        className="px-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Resend Button */}
                {!showEmailInput && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Didn&apos;t receive a code?{' '}
                      <button
                        type="button"
                        onClick={handleResendClick}
                        disabled={resendCooldown > 0}
                        className="text-indigo-600 hover:text-indigo-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {resendCooldown > 0
                          ? `Resend code (${resendCooldown}s)`
                          : 'Resend code'}
                      </button>
                    </p>
                  </div>
                )}

                {/* Back to Login Link */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="block text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto icon-3d-container icon-3d-green rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-indigo-600">Redirecting to ID verification...</p>

              <Button
                variant="primary"
                fullWidth
                onClick={() => router.push('/register/verify')}
                className="bg-indigo-600 hover:bg-indigo-700 mt-6"
              >
                Continue to ID Verification
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
