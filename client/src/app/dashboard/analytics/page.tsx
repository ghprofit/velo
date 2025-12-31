'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [timePeriod, setTimePeriod] = useState('Last 7 Days');
  const [chartTab, setChartTab] = useState('revenue');
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { id: 'upload', label: 'Upload Content', icon: 'upload', href: '/dashboard/upload' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', href: '/dashboard/analytics' },
    { id: 'earnings', label: 'Earnings', icon: 'earnings', href: '/dashboard/earnings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', href: '/dashboard/notifications' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/dashboard/settings' },
    { id: 'support', label: 'Support', icon: 'support', href: '/dashboard/support' },
  ];

  const stats = [
    {
      label: 'Total Revenue',
      value: '$12,847',
      icon: 'dollar',
      iconColor: 'text-indigo-500',
      link: 'View Wallet & Payouts',
    },
    {
      label: 'Total Unlocks',
      value: '1,247',
      icon: 'unlock',
      iconColor: 'text-indigo-500',
    },
    {
      label: 'Total Views',
      value: '25,984',
      icon: 'eye',
      iconColor: 'text-indigo-500',
    },
  ];

  const contentItems = [
    {
      title: 'Premium Tutorial #1',
      type: 'Video',
      size: '12 MB',
      views: '2,847',
      unlocks: '142',
      revenue: '$2,840',
    },
    {
      title: 'Exclusive Photos Set',
      type: 'Images',
      size: '45 MB',
      views: '1,923',
      unlocks: '96',
      revenue: '$1,920',
    },
    {
      title: 'Behind The Scenes',
      type: 'Video',
      size: '89 MB',
      views: '3,142',
      unlocks: '157',
      revenue: '$3,140',
    },
  ];

  const geoData = [
    { country: 'US', value: 4000 },
    { country: 'UK', value: 3000 },
    { country: 'CA', value: 2000 },
    { country: 'AU', value: 1200 },
    { country: 'DE', value: 900 },
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
      dollar: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      unlock: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      ),
      eye: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
            onClick={() => console.log('Logout')}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Performance Analytics</h1>
              <p className="text-gray-600">Track your content performance and revenue insights</p>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 flex items-center justify-center ${stat.iconColor}`}>
                    {renderIcon(stat.icon, 'w-8 h-8')}
                  </div>
                </div>
                {stat.link && (
                  <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                    {stat.link}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Performance Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Performance Trends</h2>
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setChartTab('revenue')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartTab === 'revenue'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartTab('views')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartTab === 'views'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Views
                </button>
                <button
                  onClick={() => setChartTab('unlocks')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartTab === 'unlocks'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Unlocks
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-80">
              <svg className="w-full h-full">
                {/* Y-axis labels */}
                <text x="10" y="20" className="text-xs fill-gray-600">2000</text>
                <text x="10" y="100" className="text-xs fill-gray-600">1500</text>
                <text x="10" y="180" className="text-xs fill-gray-600">1000</text>
                <text x="10" y="260" className="text-xs fill-gray-600">500</text>
                <text x="10" y="320" className="text-xs fill-gray-600">0</text>

                {/* Chart line with gradient fill */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#818cf8', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>

                {/* Area under the line */}
                <path
                  d="M 60 140 L 180 100 L 300 120 L 420 160 L 540 140 L 660 80 L 780 60 L 780 320 L 60 320 Z"
                  fill="url(#gradient)"
                />

                {/* Line */}
                <path
                  d="M 60 140 L 180 100 L 300 120 L 420 160 L 540 140 L 660 80 L 780 60"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                />

                {/* X-axis labels */}
                <text x="60" y="350" className="text-xs fill-gray-600" textAnchor="middle">Jan 1</text>
                <text x="180" y="350" className="text-xs fill-gray-600" textAnchor="middle">Jan 2</text>
                <text x="300" y="350" className="text-xs fill-gray-600" textAnchor="middle">Jan 3</text>
                <text x="420" y="350" className="text-xs fill-gray-600" textAnchor="middle">Jan 4</text>
                <text x="540" y="350" className="text-xs fill-gray-600" textAnchor="middle">Jan 5</text>
                <text x="660" y="350" className="text-xs fill-gray-600" textAnchor="middle">Jan 6</text>
                <text x="780" y="350" className="text-xs fill-gray-600" textAnchor="middle">Jan 7</text>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance By Content Item */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Performance By Content Item</h2>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Content Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Unlocks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contentItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              index === 0 ? 'bg-purple-100' : index === 1 ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.type} • {item.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{item.views}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{item.unlocks}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{item.revenue}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-200 flex items-center justify-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h2>

              <div className="space-y-4">
                {geoData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.country}</span>
                      <span className="text-gray-600">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-lg transition-all"
                        style={{ width: `${(item.value / 4000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
