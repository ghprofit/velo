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
      {/* Desktop/Tablet Layout */}
      <div className="h-screen bg-gray-50 hidden md:flex overflow-hidden">
        <CreatorSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden bg-gray-50 min-h-screen">
        <CreatorSidebar />
        {/* Add padding for top header and bottom navigation */}
        <main className="pt-14 pb-16 min-h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
