'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import CreatorSidebar from '@/components/CreatorSidebar';

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['CREATOR']}>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <CreatorSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
