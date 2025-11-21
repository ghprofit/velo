'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo, Button, LockClosedIcon, LockOpenIcon, ShieldCheckIcon } from '@/components/ui';

export default function CheckoutPage() {
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <LockClosedIcon className="w-4 h-4" />
            <span className="font-semibold text-gray-900">Secure Checkout</span>
            <span className="text-gray-500">• End-to-end encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-white min-h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - Preview Image */}
            <div>
              <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="relative w-full aspect-4/3 bg-linear-to-br from-blue-50 via-green-50 to-purple-50">
                  {/* Map Elements */}
                  <div className="absolute inset-0">
                    {/* Roads/Grid */}
                    <svg className="absolute inset-0 w-full h-full opacity-30">
                      <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#94a3b8" strokeWidth="2"/>
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#94a3b8" strokeWidth="3"/>
                      <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#94a3b8" strokeWidth="2"/>
                      <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#94a3b8" strokeWidth="2"/>
                      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#94a3b8" strokeWidth="3"/>
                      <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#94a3b8" strokeWidth="2"/>
                    </svg>

                    {/* Map Dots */}
                    <div className="absolute w-3 h-3 bg-orange-400 rounded-full shadow-sm" style={{ top: '20%', left: '15%' }} />
                    <div className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-sm" style={{ top: '25%', left: '40%' }} />
                    <div className="absolute w-3 h-3 bg-green-400 rounded-full shadow-sm" style={{ top: '35%', left: '25%' }} />
                    <div className="absolute w-3 h-3 bg-purple-400 rounded-full shadow-sm" style={{ top: '45%', left: '60%' }} />
                    <div className="absolute w-3 h-3 bg-pink-400 rounded-full shadow-sm" style={{ top: '55%', left: '35%' }} />
                    <div className="absolute w-3 h-3 bg-indigo-400 rounded-full shadow-sm" style={{ top: '65%', left: '70%' }} />
                    <div className="absolute w-3 h-3 bg-orange-400 rounded-full shadow-sm" style={{ top: '75%', left: '50%' }} />
                    <div className="absolute w-3 h-3 bg-green-400 rounded-full shadow-sm" style={{ top: '28%', left: '80%' }} />

                    {/* Green areas */}
                    <div className="absolute bottom-0 left-0 w-32 h-24 bg-green-200/40 rounded-tr-[3rem]"></div>
                    <div className="absolute top-20 right-20 w-20 h-20 bg-green-300/30 rounded-full blur-sm"></div>
                  </div>

                  {/* Locked Content Badge */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg border border-gray-100">
                    <LockClosedIcon className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold text-gray-900 text-sm">Locked Content</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Exclusive Behind the Scenes – Studio Tour
              </h1>

              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                $9.99
              </div>

              <p className="text-gray-700 text-base lg:text-lg leading-relaxed mb-8">
                Watch creative process and gain early access to premium behind-the-scenes footage.
              </p>

              {/* Unlock Button */}
              <Link href="/checkout/payment">
                <Button variant="primary" fullWidth className="mb-3 text-base">
                  <LockOpenIcon className="w-5 h-5" />
                  Unlock Now
                </Button>
              </Link>

              <div className="text-center mb-6">
                <span className="text-sm text-gray-600">Secure payment • Instant access</span>
              </div>

              <p className="text-gray-700 text-sm mb-3">
                Your payment is encrypted and secure.
              </p>

              {/* Payment Methods */}
              <div className="flex gap-4 flex-wrap">
                <span className="text-gray-600 text-sm font-medium">
                  Stripe
                </span>
                <span className="text-gray-600 text-sm font-medium">
                  VISA
                </span>
                <span className="text-gray-600 text-sm font-medium">
                  Mastercard
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowCookieBanner(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center pr-12">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  We Value Your Privacy
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed mb-0">
                  We use cookies to enhance your shopping experience, analyze site traffic, personalize content, and provide social media features. By clicking 'Accept All,' you consent to our use of all cookies. For details, please see our{' '}
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 underline font-medium">
                    Cookie Policy
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  onClick={() => setShowCookieBanner(false)}
                >
                  Accept All Cookies
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={() => setShowCookieBanner(false)}
                >
                  Reject All Non-Essential
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <span className="text-gray-600">Questions? <button className="text-gray-900 font-medium hover:underline">Contact support</button></span>
            <Link href="/checkout/payment" className="text-gray-900 font-medium hover:underline flex items-center gap-1">
              Continue to Checkout →
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
