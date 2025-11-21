'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import SuperAdminSidebar from '@/components/superadmin/SuperAdminSidebar';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="min-h-screen bg-gray-50 flex">
        <SuperAdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
