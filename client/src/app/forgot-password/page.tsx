'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { authApi } from '@/lib/api-client';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Unable to send reset email. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white md:bg-gradient-to-br md:from-indigo-50 md:via-white md:to-cyan-50 flex flex-col">
      {/* Mobile: Sticky Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 md:hidden">
        <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-8"/>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-12">
        <div className="w-full max-w-lg">
          {/* Logo (Desktop Only) */}
          <div className="hidden md:flex flex-col items-center mb-8">
            <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-10 mb-2"/>
            <p className="text-sm text-gray-500">Account recovery</p>
          </div>

          {/* Card */}
          <div className="bg-white md:rounded-2xl md:shadow-xl p-6 md:p-10 lg:p-12 border-0 md:border md:border-gray-100">
            {/* Title */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                Forgot Password?
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Enter your registered email, and we&apos;ll send you a reset link.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Password reset link sent!
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      If an account exists with {email}, you will receive a password reset link shortly. Please check your email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form or Success Actions */}
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-12 text-base bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {/* Trust Badges - Responsive layout */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-4">
                {/* Secure recovery */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg w-full sm:w-auto justify-center">
                  <svg className="w-4 h-4 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-700">Secure recovery</span>
                </div>

                {/* Privacy-first */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg w-full sm:w-auto justify-center">
                  <svg className="w-4 h-4 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-700">Privacy-first</span>
                </div>

                {/* Fast delivery */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg w-full sm:w-auto justify-center">
                  <svg className="w-4 h-4 text-gray-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-700">Fast delivery</span>
                </div>
              </div>
              </form>
            ) : (
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="block w-full h-12 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center transition-colors"
                >
                  Back to Login
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="block w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Send another reset link
                </button>
              </div>
            )}
          </div>

          {/* Back to Login - Mobile: Sticky, Desktop: Static */}
          <div className="text-center mt-6 md:mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm md:text-base text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 md:static md:border-0">
        <p className="text-xs md:text-sm text-gray-500 text-center">
          © 2025 Velolink. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
