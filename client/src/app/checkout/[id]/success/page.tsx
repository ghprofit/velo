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
      <header className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo_svgs/Primary_Logo(black).svg"
              alt="Velo Link"
              className="h-7 sm:h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">Purchase Complete</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-6 sm:p-8 lg:p-12">
            {/* Success Animation */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full mb-6">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Payment Successful!
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                Your purchase is complete. You now have full access to the content.
              </p>

              {/* Loading Animation */}
              <div className="flex items-center justify-center gap-2 text-indigo-600 mb-8">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium">Redirecting to your content...</span>
              </div>

              {/* Manual Button */}
              <Link
                href={`/c/${id}?token=${accessToken}`}
                className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View Your Content Now →
              </Link>
            </div>

            {/* Success Details */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Instant Access</p>
                </div>
                <div className="text-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Secure</p>
                </div>
                <div className="text-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Lifetime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Questions? Contact support</p>
          </div>
        </div>
      </main>
    </div>
  );
}
