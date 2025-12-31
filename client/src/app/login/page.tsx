'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useLogin } from '@/hooks/useLogin';
import Image from 'next/image';

export default function LoginPage() {
  const { login, isLoading, error: serverError, requiresTwoFactor, verify2FA } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login({ email, password });
    } catch {
      // Error is already handled in the hook
    }
  };

  const handle2FASubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await verify2FA(twoFactorCode);
    } catch {
      // Error is already handled in the hook
    }
  };

  // If 2FA is required, show 2FA form
  if (requiresTwoFactor) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white md:bg-gradient-to-br md:from-indigo-50 md:via-white md:to-cyan-50 flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-6">
        {/* Mobile: Sticky Header */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 md:hidden">
          <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-12"/>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-0">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left Side - Branding (Desktop Only) */}
            <div className="hidden lg:flex flex-col space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-20"/>
              </div>

              {/* Tagline */}
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-gray-900">
                  Manage your platform with confidence.
                </h2>
                <p className="text-lg text-gray-600">
                  Simple, secure access to your admin dashboard.
                </p>
              </div>

              {/* Decorative Element */}
              <div className="relative h-50">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              </div>
            </div>

            {/* Right Side - 2FA Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white md:rounded-2xl md:shadow-xl p-6 md:p-10 border-0 md:border md:border-gray-100">
                {/* 2FA Header */}
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* Server Error Display */}
                {serverError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">{serverError}</p>
                  </div>
                )}

                {/* 2FA Form */}
                <form onSubmit={handle2FASubmit} className="mt-8 space-y-6">
                  {/* 2FA Code Input */}
                  <div>
                    <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-900 mb-2">
                      Authentication Code
                    </label>
                    <input
                      id="twoFactorCode"
                      type="text"
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setTwoFactorCode(e.target.value)}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      autoComplete="off"
                      autoFocus
                      className="w-full h-12 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                      required
                    />
                  </div>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading || twoFactorCode.length !== 6}
                    className="h-12 text-base bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>

                  {/* Back to Login */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      ← Back to login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Sticky Footer */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 md:absolute md:bottom-8 md:left-0 md:right-0 md:border-0">
          <p className="text-xs md:text-sm text-gray-500 text-center">
            © 2025 Velo. All rights reserved.
          </p>
        </footer>
      </main>
    );
  }

  // Regular login form
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white md:bg-gradient-to-br md:from-indigo-50 md:via-white md:to-cyan-50 flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-6">
      {/* Mobile: Sticky Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 md:hidden">
        <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-12"/>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-0">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Side - Branding (Desktop Only) */}
          <div className="hidden lg:flex flex-col space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-40"/>
            </div>

            {/* Tagline */}
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-gray-900">
                Manage your platform with confidence.
              </h2>
              <p className="text-lg text-gray-600">
                Simple, secure access to your admin dashboard.
              </p>
            </div>

            {/* Decorative Element */}
            <div className="relative h-64">
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white md:rounded-2xl md:shadow-xl p-6 md:p-10 border-0 md:border md:border-gray-100">
              {/* Welcome Text */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Login to manage your content and earnings.
                </p>
              </div>

              {/* Server Error Display */}
              {serverError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{serverError}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="velouser@gmail.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="w-full h-12 px-4 pr-12 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="h-12 text-base bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  {isLoading ? 'Signing in...' : 'Login'}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/register"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                    >
                      Create one
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 md:absolute md:bottom-8 md:left-0 md:right-0 md:border-0">
        <p className="text-xs md:text-sm text-gray-500 text-center">
          © 2025 Velo. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
