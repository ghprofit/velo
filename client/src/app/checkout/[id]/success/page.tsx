'use client';

import { useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('token');

  useEffect(() => {
    // Redirect to content page after a short delay
    if (accessToken) {
      const timer = setTimeout(() => {
        router.push(`/c/${id}?token=${accessToken}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [accessToken, id, router]);

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Access</h1>
          <p className="text-gray-600 mb-6">No access token found</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <img
            src="/assets/logo_svgs/Primary_Logo(black).svg"
            alt="Welo Link"
            className="h-8 w-auto"
          />
        </div>
      </header>

      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Success Animation */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Your purchase is complete. You now have full access to the content.
        </p>

        {/* Loading Animation */}
        <div className="flex items-center justify-center gap-2 text-indigo-600 mb-6">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium">Redirecting to your content...</span>
        </div>

        {/* Manual Button */}
        <Link
          href={`/c/${id}?token=${accessToken}`}
          className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
        >
          View Your Content Now
        </Link>

        {/* Success Details */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-gray-900">Instant Access</p>
            </div>
            <div className="text-center">
              <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="font-medium text-gray-900">Secure</p>
            </div>
            <div className="text-center">
              <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="font-medium text-gray-900">Lifetime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
