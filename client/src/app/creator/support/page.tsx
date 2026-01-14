'use client';

import { useState } from 'react';
import Link from 'next/link';
import TermsModal from '../../home/TermsModal';
import FloatingLogo from '@/components/FloatingLogo';

export default function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState('terms');

  const openModal = (section: string) => {
    setModalSection(section);
    setIsModalOpen(true);
  };

  return (
    <>
        <TermsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          section={modalSection}
        />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Floating Brand Logo */}
          <FloatingLogo
            position="top-right"
            size={95}
            animation="rotate"
            opacity={0.07}
          />

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">Help & Support Center</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Find immediate answers or submit a ticket for personalized assistance.</p>
          </div>

          {/* Submit a Support Ticket Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Submit a Support Ticket</h2>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600">For detailed issues or technical reports. We guarantee a response within 24 hours.</p>
                </div>
              </div>
              <Link
                href="/creator/support/ticket"
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap text-center text-sm sm:text-base"
              >
                Open Support Form
              </Link>
            </div>
          </div>

          {/* Top Creator Resources */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Top Creator Resources</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Payouts & Fees */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Payouts & Fees</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <button onClick={() => openModal('pricing')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Payout Threshold & Fees</span>
                  </button>
                  <button onClick={() => openModal('pricing')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Withdrawing Funds</span>
                  </button>
                  <button onClick={() => openModal('help')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Tax Documents (1099)</span>
                  </button>
                </div>
              </div>

              {/* Account & Security */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Account & Security</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Link href="/settings/2fa" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Two-Factor Authentication Setup</span>
                  </Link>
                  <button onClick={() => openModal('security')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Updating Payment Methods</span>
                  </button>
                  <button onClick={() => openModal('help')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Account Deactivation</span>
                  </button>
                </div>
              </div>

              {/* Content & Moderation */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Content & Moderation</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <button onClick={() => openModal('compliance')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Content Guidelines</span>
                  </button>
                  <button onClick={() => openModal('pricing')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Disputes & Refunds</span>
                  </button>
                  <button onClick={() => openModal('help')} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors group w-full text-left">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Troubleshooting Upload Errors</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Policy Links */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Legal & Policies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => openModal('terms')}
                className="bg-white rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow text-left group"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-indigo-600 transition-colors">Terms of Service</h3>
                <p className="text-xs sm:text-sm text-gray-600">Platform rules and user agreements</p>
              </button>
              <button
                onClick={() => openModal('privacy')}
                className="bg-white rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow text-left group"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-indigo-600 transition-colors">Privacy Policy</h3>
                <p className="text-xs sm:text-sm text-gray-600">How we handle your data</p>
              </button>
              <button
                onClick={() => openModal('compliance')}
                className="bg-white rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow text-left group"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-indigo-600 transition-colors">Compliance</h3>
                <p className="text-xs sm:text-sm text-gray-600">Platform rules and responsibilities</p>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 sm:mt-16 text-center">
            <p className="text-xs sm:text-sm text-gray-500">© 2025 Velolink — Designed to protect creators and their data.</p>
          </div>
        </div>
    </>
  );
}
