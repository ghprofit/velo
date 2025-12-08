'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TicketSuccessPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const ticketId = '#VELOLink-12345';

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Ticket Submitted Successfully!</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Your support request has been received and is being processed</p>
        </div>

        {/* Ticket ID Card */}
        <div className="bg-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <p className="text-center text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Your Ticket ID is:</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{ticketId}</h2>
            <button
              onClick={handleCopyId}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-white transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm sm:text-base text-gray-700">
              We aim to respond within <span className="font-semibold text-gray-900">24 hours</span>
            </p>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-600">
            You can track the live status and reply to our agent directly from your Active Tickets dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/creator/support"
            className="px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Back to Support Center
          </Link>

          <Link
            href="/creator"
            className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-gray-500">Velolink Admin v1.0. Secure session management enabled.</p>
        </div>
      </div>
    </div>
  );
}
