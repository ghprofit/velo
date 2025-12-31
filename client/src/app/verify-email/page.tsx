'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useVerifyEmailMutation } from '@/state/api';
import Image from 'next/image';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token).unwrap();
        setStatus('success');
        setMessage(response.message);

        // Redirect to ID verification after 3 seconds
        setTimeout(() => {
          router.push('/register/verify');
        }, 3000);
      } catch (error: unknown) {
        const apiError = error as { data?: { message?: string } };
        setStatus('error');
        setMessage(apiError.data?.message || 'Verification failed. Please try again.');
      }
    };

    verify();
  }, [token, verifyEmail, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo"/>
          </div>

          {/* Status Icon */}
          {status === 'verifying' && (
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Verifying Email</h1>
              <p className="text-gray-600 mt-2">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Email Verified!</h1>
              <p className="text-gray-600 mt-2">{message}</p>
              <p className="text-sm text-indigo-600 mt-4">Redirecting to ID verification...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Verification Failed</h1>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
          )}

          {status === 'no-token' && (
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Invalid Link</h1>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => router.push('/register/verify')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Continue to ID Verification
              </Button>
            )}

            {(status === 'error' || status === 'no-token') && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => router.push('/login')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Login
                </Button>
                <Link
                  href="/register"
                  className="block text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Create a new account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
