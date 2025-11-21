'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/app/redux';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * AuthGuard component to protect routes based on authentication and roles
 *
 * Usage:
 * - Wrap protected pages/layouts with this component
 * - Specify allowedRoles to restrict access to specific user types
 * - If user is not authenticated, redirects to login
 * - If user role doesn't match, redirects to appropriate dashboard
 */
export default function AuthGuard({
  children,
  allowedRoles = [],
  redirectTo
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo || '/login');
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0 && user) {
      const hasRequiredRole = allowedRoles.includes(user.role);

      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'SUPER_ADMIN') {
          router.push('/superadmin/dashboard');
        } else if (user.role === 'ADMIN' || user.role === 'SUPPORT') {
          router.push('/admin/dashboard');
        } else {
          router.push('/creator');
        }
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, redirectTo]);

  // Show loading or nothing while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check role access
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
