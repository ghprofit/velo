'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useLogin } from '@/hooks/useLogin';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/PageTransition';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import FloatingLogo from '@/components/FloatingLogo';

export default function LoginPage() {
  const { login, isLoading, error: serverError, requiresTwoFactor, verify2FA } = useLogin();
  // const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

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
      <PageTransition>
        <main className="min-h-screen bg-gradient-playful-2 flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-6">
        {/* Mobile: Sticky Header */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 md:hidden">
          <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" width={180} height={48} className="h-12"/>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-0">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left Side - Branding (Desktop Only) */}
            <motion.div
              className="hidden lg:flex flex-col space-y-8"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Logo */}
              <motion.div variants={staggerItem} className="flex items-center gap-6">
                <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" width={300} height={80} className="h-20"/>
              </motion.div>

              {/* Tagline */}
              <motion.div variants={staggerItem} className="space-y-3">
                <h2 className="text-4xl font-bold text-gray-900">
                  Manage your platform with confidence.
                </h2>
                <p className="text-lg text-gray-600">
                  Simple, secure access to your admin dashboard.
                </p>
              </motion.div>

              {/* Decorative Element */}
              <div className="relative h-50">
                <motion.div
                  className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                  animate={{
                    x: [0, 30, -20, 0],
                    y: [0, -50, 20, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute top-0 right-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                  animate={{
                    x: [0, -30, 20, 0],
                    y: [0, 40, -20, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </div>
            </motion.div>

            {/* Right Side - 2FA Form */}
            <motion.div
              className="w-full max-w-md mx-auto"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={staggerItem}
                className="bg-white md:rounded-2xl shadow-3d p-6 md:p-10 border-0 md:border md:border-gray-100"
              >
                {/* 2FA Header */}
                <motion.div variants={staggerItem} className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </motion.div>

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
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Mobile: Sticky Footer */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 md:absolute md:bottom-8 md:left-0 md:right-0 md:border-0">
          <p className="text-xs md:text-sm text-gray-500 text-center">
            © 2025 Velo. All rights reserved.
          </p>
        </footer>
      </main>
      </PageTransition>
    );
  }

  // Regular login form
  return (
    <PageTransition>
      <main className="min-h-screen bg-gradient-playful-2 flex flex-col md:flex-row md:items-center md:justify-center p-0 md:p-6 relative">
      {/* Floating Brand Logos */}
      <FloatingLogo
        position="top-right"
        size={100}
        animation="float-rotate"
        opacity={0.10}
      />
      <FloatingLogo
        position="bottom-left"
        size={85}
        animation="pulse"
        opacity={0.08}
      />

      {/* Mobile: Sticky Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100 md:hidden">
        <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" width={180} height={48} className="h-12"/>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-0">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Side - Branding (Desktop Only) */}
          <motion.div
            className="hidden lg:flex flex-col space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Logo */}
            <motion.div variants={staggerItem} className="flex items-center gap-6">
              <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" width={600} height={160} className="h-40"/>
            </motion.div>

            {/* Tagline */}
            <motion.div variants={staggerItem} className="space-y-3">
              <h2 className="text-4xl font-bold text-gray-900">
                Manage your platform with confidence.
              </h2>
              <p className="text-lg text-gray-600">
                Simple, secure access to your admin dashboard.
              </p>
            </motion.div>

            {/* Decorative Element */}
            <div className="relative h-64">
              <motion.div
                className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                  x: [0, 30, -20, 0],
                  y: [0, -50, 20, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                animate={{
                  x: [0, -30, 20, 0],
                  y: [0, 40, -20, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            className="w-full max-w-md mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={staggerItem}
              className="bg-white md:rounded-2xl shadow-3d p-6 md:p-10 border-0 md:border md:border-gray-100"
            >
              {/* Welcome Text */}
              <motion.div variants={staggerItem} className="text-center md:text-left">
                <motion.h2 
                  className="text-2xl md:text-3xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  Welcome Back! ✨
                </motion.h2>
                <motion.p 
                  className="text-sm md:text-base text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Ready to create amazing content and connect with buyers? Let&apos;s go! 🚀
                </motion.p>
              </motion.div>

              {/* Server Error Display */}
              {serverError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{serverError}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* Email Input */}
                <motion.div variants={staggerItem}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <motion.input
                    id="email"
                    type="email"
                    placeholder="velouser@gmail.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 text-base border-2 border-gray-300 rounded-xl focus-glow outline-none transition-all"
                    animate={showEmailError ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}}
                    required
                  />
                </motion.div>

                {/* Password Input */}
                <motion.div variants={staggerItem}>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="w-full h-12 px-4 pr-12 text-base border-2 border-gray-300 rounded-xl focus-glow outline-none transition-all"
                      animate={showPasswordError ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}}
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
                </motion.div>

                {/* Forgot Password Link */}
                <motion.div variants={staggerItem} className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </motion.div>

                {/* Login Button */}
                <motion.div variants={staggerItem}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    {isLoading ? 'Signing in...' : 'Login'}
                  </motion.button>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div variants={staggerItem} className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/register"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                    >
                      Create one
                    </Link>
                  </p>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile: Sticky Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 md:absolute md:bottom-8 md:left-0 md:right-0 md:border-0">
        <p className="text-xs md:text-sm text-gray-500 text-center">
          © 2025 Velolink. All rights reserved.
        </p>
      </footer>
    </main>
    </PageTransition>
  );
}
