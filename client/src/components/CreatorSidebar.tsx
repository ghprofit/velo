'use client';

import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutModal from './LogoutModal';
import Image from 'next/image';

export default function CreatorSidebar(): JSX.Element {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Check screen size and set appropriate state
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        setIsMobileMenuOpen(false);
      } else if (width < 1024) {
        setScreenSize('tablet');
        setIsCollapsed(true);
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/creator' },
    { id: 'upload', label: 'Upload Content', icon: 'upload', href: '/creator/upload' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', href: '/creator/analytics' },
    { id: 'earnings', label: 'Earnings', icon: 'earnings', href: '/creator/earnings' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/creator/settings' },
    { id: 'support', label: 'Support', icon: 'support', href: '/creator/support' },
  ];

  // Bottom navigation items for mobile (limited set)
  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: 'dashboard', href: '/creator' },
    { id: 'upload', label: 'Upload', icon: 'upload', href: '/creator/upload' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', href: '/creator/analytics' },
    { id: 'earnings', label: 'Earnings', icon: 'earnings', href: '/creator/earnings' },
    { id: 'more', label: 'More', icon: 'menu', href: '#' },
  ];

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const icons: Record<string, JSX.Element> = {
      dashboard: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      upload: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      analytics: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      earnings: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      notifications: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      settings: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      support: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      logout: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      collapse: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      ),
      expand: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      ),
      menu: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      close: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  const isActive = (href: string) => {
    if (href === '/creator') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Mobile View: Top header + Bottom navigation + Slide-out drawer
  if (screenSize === 'mobile') {
    return (
      <>
        {/* Mobile Top Header */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-8" />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {renderIcon('menu', 'w-6 h-6')}
          </button>
        </div>

        {/* Mobile Slide-out Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Slide-out Menu */}
        <aside
          className={`fixed top-0 right-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              {renderIcon('close', 'w-5 h-5')}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {renderIcon(item.icon)}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-3 border-t border-gray-200">
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowLogoutModal(true);
              }}
            >
              {renderIcon('logout')}
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1 safe-area-pb">
          <div className="flex items-center justify-around">
            {bottomNavItems.map((item) => (
              item.id === 'more' ? (
                <button
                  key={item.id}
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex flex-col items-center gap-1 px-3 py-2 text-gray-500"
                >
                  {renderIcon(item.icon, 'w-5 h-5')}
                  <span className="text-xs">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 ${
                    isActive(item.href)
                      ? 'text-indigo-600'
                      : 'text-gray-500'
                  }`}
                >
                  {renderIcon(item.icon, 'w-5 h-5')}
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            ))}
          </div>
        </nav>

        {/* Logout Modal */}
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            window.location.href = '/login';
          }}
        />
      </>
    );
  }

  // Tablet & Desktop View: Traditional sidebar
  return (
    <>
      <aside
        className={`h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo & Toggle */}
        <div className={`p-4 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <Image src="/assets/logo_svgs/Primary_Logo(black).svg" alt="velo logo" className="h-12" />
          ) : (
            <Image src="/assets/logo_svgs/Brand_Icon(black).svg" alt="velo logo" className="h-8 w-8" />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 ${
              isCollapsed ? 'absolute -right-3 top-6 bg-white border border-gray-200 shadow-sm' : ''
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? renderIcon('expand', 'w-4 h-4') : renderIcon('collapse', 'w-4 h-4')}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              {renderIcon(item.icon)}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
            onClick={() => setShowLogoutModal(true)}
            title={isCollapsed ? 'Logout' : undefined}
          >
            {renderIcon('logout')}
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          window.location.href = '/login';
        }}
      />
    </>
  );
}
