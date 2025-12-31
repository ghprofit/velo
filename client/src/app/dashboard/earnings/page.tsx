'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RequestPayoutModal from '@/components/RequestPayoutModal';
import LogoutModal from '@/components/LogoutModal';

export default function EarningsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('earnings');
  const [timePeriod, setTimePeriod] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [contentFilter, setContentFilter] = useState('All Content');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'upload', label: 'Upload Content', icon: 'upload', href: '/dashboard/upload' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', href: '/dashboard/analytics' },
    { id: 'earnings', label: 'Earnings', icon: 'earnings', href: '/dashboard/earnings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', href: '/dashboard/notifications' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/dashboard/settings' },
    { id: 'support', label: 'Support', icon: 'support', href: '/dashboard/support' },
  ];

  const payoutActivity = [
    {
      title: 'Payout to Bank Account',
      date: 'Dec 15, 2024',
      time: '10:42 AM',
      amount: '$1,500.00',
      status: 'Completed',
      statusColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Payout to Bank Account',
      date: 'Dec 8, 2024',
      time: '3:15 PM',
      amount: '$980.00',
      status: 'Processing',
      statusColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    {
      title: 'Payout to Bank Account',
      date: 'Dec 1, 2024',
      time: '9:20 AM',
      amount: '$2,200.00',
      status: 'Completed',
      statusColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
  ];

  const transactions = [
    {
      date: 'Dec 18, 2024',
      time: '2:45 PM',
      type: 'Purchase',
      typeColor: 'text-green-600',
      typeBg: 'bg-green-50',
      content: 'Premium UI Design Course',
      buyer: 'buyer***47',
      method: 'Stripe Card',
      amount: '+$149.00',
      amountColor: 'text-green-600',
    },
    {
      date: 'Dec 17, 2024',
      time: '11:20 AM',
      type: 'Purchase',
      typeColor: 'text-green-600',
      typeBg: 'bg-green-50',
      content: 'Design Template Bundle',
      buyer: 'buyer***92',
      method: 'Apple Pay',
      amount: '+$79.99',
      amountColor: 'text-green-600',
    },
    {
      date: 'Dec 15, 2024',
      time: '10:42 AM',
      type: 'Payout',
      typeColor: 'text-indigo-600',
      typeBg: 'bg-indigo-50',
      content: 'N/A',
      buyer: 'Bank Payout',
      method: 'Bank Transfer',
      amount: '-$1,500.00',
      amountColor: 'text-gray-900',
    },
    {
      date: 'Dec 14, 2024',
      time: '4:15 PM',
      type: 'Purchase',
      typeColor: 'text-green-600',
      typeBg: 'bg-green-50',
      content: 'Workshop Series Access',
      buyer: 'buyer***23',
      method: 'Google Pay',
      amount: '+$199.00',
      amountColor: 'text-green-600',
    },
    {
      date: 'Dec 13, 2024',
      time: '9:30 AM',
      type: 'Fee',
      typeColor: 'text-gray-600',
      typeBg: 'bg-gray-50',
      content: 'Platform Fee',
      buyer: 'VELO Platform',
      method: 'Auto-deduct',
      amount: '-$14.90',
      amountColor: 'text-gray-900',
    },
    {
      date: 'Dec 12, 2024',
      time: '3:55 PM',
      type: 'Purchase',
      typeColor: 'text-green-600',
      typeBg: 'bg-green-50',
      content: 'Premium UI Design Course',
      buyer: 'buyer***88',
      method: 'Stripe Card',
      amount: '+$149.00',
      amountColor: 'text-green-600',
    },
    {
      date: 'Dec 10, 2024',
      time: '1:20 PM',
      type: 'Refund',
      typeColor: 'text-red-600',
      typeBg: 'bg-red-50',
      content: 'Design Template Bundle',
      buyer: 'buyer***34',
      method: 'Stripe Card',
      amount: '-$79.99',
      amountColor: 'text-red-600',
    },
    {
      date: 'Dec 8, 2024',
      time: '5:10 PM',
      type: 'Purchase',
      typeColor: 'text-green-600',
      typeBg: 'bg-green-50',
      content: 'Workshop Series Access',
      buyer: 'buyer***61',
      method: 'PayPal',
      amount: '+$199.00',
      amountColor: 'text-green-600',
    },
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
    };
    return icons[iconName] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="14" width="16" height="12" rx="2" fill="black"/>
              <path d="M11 14V10C11 7.23858 13.2386 5 16 5C18.7614 5 21 7.23858 21 10V14" stroke="black" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="20" r="1.5" fill="white"/>
            </svg>
            <div className="border-l-2 border-gray-900 pl-3">
              <div className="text-xl">
                <span className="font-bold text-gray-900">Velo</span>
                <span className="font-light text-gray-900">Link</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full"
            onClick={() => setShowLogoutModal(true)}
          >
            {renderIcon('logout')}
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Wallet & Payouts</h1>
              <p className="text-gray-600">Manage your earnings and request payouts</p>
            </div>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>

        <div className="p-8">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Available Balance */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-green-100 text-sm mb-2">Available Balance</p>
                  <p className="text-4xl font-bold">$2,847.50</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="w-full bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request Payout
              </button>
            </div>

            {/* Pending Balance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Pending Balance</p>
                  <p className="text-3xl font-bold text-gray-900">$1,234.80</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-yellow-900">7-Day Buffer Rule</p>
                  <p className="text-xs text-yellow-700 mt-1">Funds from new purchases clear in 7 days</p>
                </div>
              </div>
            </div>

            {/* Total Lifetime Earnings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Lifetime Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">$18,562.30</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Total Payouts</span>
                <span className="text-sm font-semibold text-gray-900">$14,480.00</span>
              </div>
            </div>
          </div>

          {/* Recent Payout Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payout Activity</h2>
              <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All Payouts
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="space-y-4">
              {payoutActivity.map((payout, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${payout.iconBg} rounded-full flex items-center justify-center`}>
                      {payout.status === 'Completed' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payout.title}</p>
                      <p className="text-sm text-gray-500">{payout.date} • {payout.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{payout.amount}</p>
                    <p className={`text-sm ${payout.statusColor} font-medium`}>{payout.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>

              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search transactions (Buyer, Content, Amount...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option>All Types</option>
                  <option>Purchase</option>
                  <option>Payout</option>
                  <option>Refund</option>
                  <option>Fee</option>
                </select>
                <select
                  value={contentFilter}
                  onChange={(e) => setContentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option>All Content</option>
                  <option>Premium UI Design Course</option>
                  <option>Design Template Bundle</option>
                  <option>Workshop Series Access</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Content Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Buyer/Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.date}</p>
                          <p className="text-xs text-gray-500">{transaction.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.typeBg} ${transaction.typeColor}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{transaction.content}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{transaction.buyer}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{transaction.method}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-semibold ${transaction.amountColor}`}>
                          {transaction.amount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing 1 to 8 of 247 transactions</p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-medium text-sm">
                    1
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm">
                    2
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm">
                    3
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Request Payout Modal */}
      <RequestPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        availableBalance={2847.50}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          router.push('/login');
        }}
      />
    </div>
  );
}
