'use client';

export default function SuperAdminDashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
      </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {/* Total Platform Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Platform Revenue</p>
                  <p className="text-xs text-gray-500">Last 30 Days</p>
                  <p className="text-3xl font-bold text-green-500 mt-2">$2.4M</p>
                  <p className="text-sm text-green-500 mt-1">
                    <span className="inline-block">↑</span>12.5%
                  </p>
                </div>
              </div>
            </div>

            {/* Net VELO Commission */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Net VELO Commission</p>
                  <p className="text-xs text-gray-500">Last 30 Days</p>
                  <p className="text-3xl font-bold text-green-500 mt-2">$ 360K</p>
                  <p className="text-sm text-green-500 mt-1">
                    <span className="inline-block">↑</span>8.3%
                  </p>
                </div>
                <div className="text-green-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending KYC Submissions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending KYC</p>
                  <p className="text-xs text-gray-500">Submissions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">127</p>
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Requires Action
                  </p>
                </div>
                <div className="text-yellow-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Creators */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Creators</p>
                  <p className="text-xs text-gray-500">Last 24 Hours</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">1,847</p>
                  <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online Now
                  </p>
                </div>
                <div className="text-gray-700">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">System Health</p>
                  <p className="text-xs text-gray-500">All Services</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All Operational
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">99.9% Uptime</p>
                </div>
                <div className="text-green-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Critical System Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Critical System Alerts & Required Actions</h2>

              <div className="space-y-4">
                {/* High-Value Payout Hold */}
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-red-500 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-red-600">High-Value Payout Hold</p>
                      <p className="text-sm text-red-500">Creator ID #2847 - $45,000 pending review</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Flagged Content */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-500 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-orange-600">Flagged Content</p>
                      <p className="text-sm text-orange-500">3 items require immediate moderation</p>
                      <p className="text-xs text-gray-500 mt-1">45 minutes ago</p>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Error */}
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-red-500 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-red-600">Payment Gateway Error</p>
                      <p className="text-sm text-red-500">Stripe webhook failures detected</p>
                      <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue vs. Payouts Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue vs. Payouts (Monthly Trend)</h2>

              {/* Chart Legend */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-red-400"></div>
                  <span className="text-sm text-gray-600">Payouts</span>
                </div>
              </div>

              {/* Simple Chart Representation */}
              <div className="relative h-48 mb-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                  <span>$2,400,000</span>
                  <span>$2,200,000</span>
                  <span>$2,000,000</span>
                  <span>$1,800,000</span>
                  <span>$1,600,000</span>
                </div>

                {/* Chart Area */}
                <div className="ml-20 h-full border-l border-b border-gray-200 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    <div className="h-1/4 border-b border-gray-100"></div>
                    <div className="h-1/4 border-b border-gray-100"></div>
                    <div className="h-1/4 border-b border-gray-100"></div>
                    <div className="h-1/4 border-b border-gray-100"></div>
                  </div>

                  {/* Revenue Line (Blue) - simplified SVG */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      points="0,120 50,100 100,85 150,90 200,70 250,40"
                    />
                  </svg>

                  {/* Payouts Line (Red) - simplified SVG */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#F87171"
                      strokeWidth="2"
                      points="0,150 50,140 100,135 150,120 200,125 250,110"
                    />
                  </svg>

                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between transform translate-y-6 text-xs text-gray-500">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>

              {/* Profit Margin */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Platform Profit Margin</p>
                    <p className="text-sm text-green-500">+2.1% from last month</p>
                  </div>
                  <p className="text-3xl font-bold text-green-500">15.2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Moderation & User Review Queue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Moderation & User Review Queue</h2>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Go to Review Queue
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Queue Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Pending Items</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Priority</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Avg. Wait Time</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* KYC Verification */}
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">KYC Verification</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-900">127</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                        High
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">2.3 hours</td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-green-500 hover:text-green-600 font-medium">Review</button>
                    </td>
                  </tr>

                  {/* Content Moderation */}
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-orange-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">Content Moderation</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-900">43</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                        High
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">1.8 hours</td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-green-500 hover:text-green-600 font-medium">Review</button>
                    </td>
                  </tr>

                  {/* Payout Disputes */}
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-yellow-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">Payout Disputes</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-900">18</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        Medium
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">4.2 hours</td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-green-500 hover:text-green-600 font-medium">Review</button>
                    </td>
                  </tr>

                  {/* Account Appeals */}
                  <tr>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">Account Appeals</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-900">31</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        Low
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">6.7 hours</td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-green-500 hover:text-green-600 font-medium">Review</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
