'use client';

import { Button } from '@/components/ui';
import Link from 'next/link';
import FloatingLogo from '@/components/FloatingLogo';

export default function PaymentFailedPage() {
  // In a real app, these would come from URL params or session storage
  const orderDetails = {
    orderId: '#VELO-20493',
    amountAttempted: '$10.49 USD'
  };

  return (
    <div className="min-h-screen bg-gray-600 flex items-center justify-center p-6 relative">
      {/* Floating Logo */}
      <FloatingLogo
        position="top-right"
        size={100}
        animation="float"
        opacity={0.10}
      />

      {/* Main Error Card */}
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-12">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-40"></div>
            {/* Icon circle */}
            <div className="relative bg-red-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            We couldn&apos;t complete your payment at this time.<br />
            Please try again or use another method.
          </p>
        </div>

        {/* Order Details */}
        <div className="border-t border-b border-gray-200 py-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Order ID</span>
            <span className="text-sm font-bold text-gray-900">{orderDetails.orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount Attempted</span>
            <span className="text-sm font-bold text-gray-900">{orderDetails.amountAttempted}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Try Again Button */}
          <Link href="/checkout/payment">
            <Button variant="primary" fullWidth className="text-base py-3.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </Button>
          </Link>

          {/* Change Payment Method Button */}
          <Link href="/checkout/payment">
            <Button variant="outline" fullWidth className="text-base py-3.5 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Change Payment Method
            </Button>
          </Link>
        </div>

        {/* Support Message */}
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          If the issue persists, contact Velo Support at{' '}
          <a href="mailto:support@velolink.com" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
            support@velolink.com
          </a>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0">
        <p className="text-sm text-gray-800 text-center">
          Powered by Velo — Secure pay-per-view for creators.
        </p>
      </div>
    </div>
  );
}
