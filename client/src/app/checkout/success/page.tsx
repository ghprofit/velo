'use client';

import { Button, CheckCircleIcon } from '@/components/ui';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  // In a real app, these would come from URL params or session storage
  const transactionDetails = {
    contentTitle: 'Exclusive Tutorial: Mastering Portrait Edits',
    amountPaid: '$24.00',
    paymentMethod: 'Card •••• 4242',
    transactionId: 'TRX-9F21-AB38',
    dateTime: 'Oct 30, 2025 • 2:14 PM'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Decorative Background Dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-40" style={{ top: '10%', left: '15%' }} />
        <div className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full opacity-30" style={{ top: '15%', left: '75%' }} />
        <div className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-40" style={{ top: '25%', right: '10%' }} />
        <div className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-50" style={{ top: '35%', left: '8%' }} />
        <div className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-30" style={{ bottom: '20%', left: '12%' }} />
        <div className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-40" style={{ bottom: '30%', right: '18%' }} />

        {/* Decorative Slashes */}
        <div className="absolute w-8 h-0.5 bg-indigo-400 rounded opacity-30 rotate-45" style={{ top: '12%', left: '30%' }} />
        <div className="absolute w-6 h-0.5 bg-purple-400 rounded opacity-25 rotate-45" style={{ top: '28%', right: '25%' }} />
        <div className="absolute w-7 h-0.5 bg-indigo-400 rounded opacity-20 -rotate-45" style={{ bottom: '35%', left: '20%' }} />
      </div>

      {/* Main Card */}
      <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-lg p-12">
        {/* Success Icon with Ripples */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Ripple circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-teal-200 opacity-40"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-teal-300 opacity-50"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-teal-400 opacity-60"></div>
            </div>
            {/* Check Icon */}
            <div className="relative bg-teal-500 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Payment Successful
          </h1>
          <p className="text-base text-gray-600">
            Your payment was processed successfully. Your content is now unlocked.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <div className="space-y-6">
            {/* Content Title */}
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-gray-600">Content Title</span>
              <span className="text-sm font-semibold text-gray-900 text-right">
                {transactionDetails.contentTitle}
              </span>
            </div>

            {/* Amount Paid */}
            <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-200">
              <span className="text-sm text-gray-600">Amount Paid</span>
              <span className="text-sm font-semibold text-gray-900">
                {transactionDetails.amountPaid}
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-200">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-semibold text-gray-900">
                {transactionDetails.paymentMethod}
              </span>
            </div>

            {/* Transaction ID */}
            <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-200">
              <span className="text-sm text-gray-600">Transaction ID</span>
              <span className="text-sm font-semibold text-gray-900">
                {transactionDetails.transactionId}
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-200">
              <span className="text-sm text-gray-600">Date & Time</span>
              <span className="text-sm font-semibold text-gray-900">
                {transactionDetails.dateTime}
              </span>
            </div>
          </div>
        </div>

        {/* View Content Button */}
        <Link href="/content">
          <Button variant="primary" fullWidth className="text-base py-3.5 mb-6">
            View Content
          </Button>
        </Link>

        {/* Receipt Message */}
        <p className="text-sm text-gray-500 text-center">
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  );
}
