// hooks/useAdminAccess.ts
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type AdminRole = 'FINANCIAL_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_SPECIALIST' | 'ANALYTICS_ADMIN';

interface AdminAccessConfig {
  allowedRoles: AdminRole[];
  redirectTo?: string;
}

export function useAdminAccess({ allowedRoles, redirectTo = '/admin/dashboard' }: AdminAccessConfig) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If not an admin, redirect to home
    // Accept both ADMIN and SUPPORT roles (SUPPORT is for admin users with specific roles)
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
      router.push('/login');
      return;
    }

    // If no adminRole (e.g., SUPER_ADMIN), allow access
    if (!user.adminRole) {
      return;
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(user.adminRole)) {
      router.push(redirectTo);
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  return {
    hasAccess: !loading && (user?.role === 'ADMIN' || user?.role === 'SUPPORT') && (!user.adminRole || allowedRoles.includes(user.adminRole)),
    loading,
  };
}
