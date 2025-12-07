'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VerificationStatusBanner from '@/components/VerificationStatusBanner';
import { authApi, analyticsApi } from '@/lib/api-client';

interface CreatorProfile {
  totalViews: number;
  totalEarnings: number;
  totalPurchases: number;
}

interface UserProfile {
  displayName: string;
  email: string;
  creatorProfile?: CreatorProfile;
}

interface TrendData {
  date: string;
  revenue: number;
  unlocks: number;
  views: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  thumbnailUrl: string;
  views: number;
  unlocks: number;
  revenue: number;
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trend and content data states
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [trendPeriod, setTrendPeriod] = useState('Last 7 Days');
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authApi.getProfile();
        setProfile(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch trend data
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoadingTrends(true);
        const response = await analyticsApi.getTrends(trendPeriod, 'revenue');
        const data = response.data?.data || response.data;
        setTrendData(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error('Failed to fetch trends:', error);
        setTrendData([]);
      } finally {
        setLoadingTrends(false);
      }
    };

    fetchTrends();
  }, [trendPeriod]);

  // Fetch content performance
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoadingContent(true);
        const response = await analyticsApi.getContentPerformance(1, 5);
        const data = response.data?.data || response.data;
        setContentItems(data?.items || []);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        setContentItems([]);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, []);

  // Stats data from backend
  const stats = [
    {
      label: 'Total Views',
      value: profile?.creatorProfile?.totalViews?.toLocaleString() || '0',
      icon: 'eye',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Total Earnings',
      value: `$${profile?.creatorProfile?.totalEarnings?.toFixed(2) || '0.00'}`,
      icon: 'dollar',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Unlocks/Purchases',
      value: profile?.creatorProfile?.totalPurchases?.toLocaleString() || '0',
      icon: 'unlock',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
  ];

  // Process chart data based on selected period
  const getChartData = () => {
    if (trendData.length === 0) return [];

    switch (trendPeriod) {
      case 'Last 7 Days':
        // Show daily data for the week
        return trendData.slice(-7);

      case 'Last 30 Days':
        // Show daily data but limit to reasonable display (show every day)
        return trendData.slice(-30);

      case 'Last Year':
        // Aggregate by month
        const monthlyData: Record<string, { date: string; revenue: number; unlocks: number; views: number }> = {};
        trendData.forEach((d) => {
          const date = new Date(d.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { date: monthKey + '-01', revenue: 0, unlocks: 0, views: 0 };
          }
          monthlyData[monthKey].revenue += d.revenue;
          monthlyData[monthKey].unlocks += d.unlocks;
          monthlyData[monthKey].views += d.views;
        });
        return Object.values(monthlyData).slice(-12);

      case 'All Time':
        // Aggregate by month for all time
        const allTimeMonthly: Record<string, { date: string; revenue: number; unlocks: number; views: number }> = {};
        trendData.forEach((d) => {
          const date = new Date(d.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!allTimeMonthly[monthKey]) {
            allTimeMonthly[monthKey] = { date: monthKey + '-01', revenue: 0, unlocks: 0, views: 0 };
          }
          allTimeMonthly[monthKey].revenue += d.revenue;
          allTimeMonthly[monthKey].unlocks += d.unlocks;
          allTimeMonthly[monthKey].views += d.views;
        });
        return Object.values(allTimeMonthly);

      default:
        return trendData.slice(-7);
    }
  };

  const chartData = getChartData();

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const icons: Record<string, JSX.Element> = {
      eye: (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
    };
    return icons[iconName] || null;
  };

  // Format date for chart labels based on period
  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);

    switch (trendPeriod) {
      case 'Last 7 Days':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'Last 30 Days':
        return date.toLocaleDateString('en-US', { day: 'numeric' });
      case 'Last Year':
      case 'All Time':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  return (
    <>
        <div className="p-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && profile && (
            <>
              {/* Welcome Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {profile.displayName || 'Creator'}
                </h1>
                <p className="text-gray-600">
                  Here's an overview of your content performance.
                </p>
              </div>

              {/* Verification Status Banner */}
              <VerificationStatusBanner />

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center ${stat.iconColor}`}>
                        {renderIcon(stat.icon, 'w-6 h-6')}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Earnings Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Earnings Trend</h2>
                  <select
                    value={trendPeriod}
                    onChange={(e) => setTrendPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="Last 7 Days">This Week</option>
                    <option value="Last 30 Days">This Month</option>
                    <option value="Last Year">This Year</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>

                {/* Bar Chart Visualization */}
                <div className="h-64">
                  {loadingTrends ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500">Loading chart...</div>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500">No earnings data for this period</div>
                    </div>
                  ) : (
                    <div className="flex items-end justify-between gap-3 h-full">
                      {chartData.map((data, index) => {
                        const heightPercent = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center h-full">
                            <div className="flex-1 w-full flex items-end">
                              <div
                                className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700 cursor-pointer"
                                style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                title={`$${data.revenue.toFixed(2)}`}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-2">{formatChartDate(data.date)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Chart Legend */}
                {!loadingTrends && chartData.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Total: ${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}</span>
                    <span>
                      Avg: ${(chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length).toFixed(2)}
                      /{trendPeriod === 'Last Year' || trendPeriod === 'All Time' ? 'month' : 'day'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Performance Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Content Performance</h2>
                  <Link
                    href="/creator/analytics"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  {loadingContent ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-gray-500">Loading content...</div>
                    </div>
                  ) : contentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-gray-500 mb-4">No content uploaded yet</div>
                      <Link
                        href="/creator/upload"
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Upload Your First Content
                      </Link>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Content Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Type
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {contentItems.map((content) => (
                          <tr
                            key={content.id}
                            onClick={() => router.push(`/creator/content/${content.id}`)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img
                                  src={content.thumbnailUrl || 'https://via.placeholder.com/48x48?text=No+Image'}
                                  alt={content.title}
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=No+Image';
                                  }}
                                />
                                <span className="text-sm font-medium text-gray-900">{content.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {content.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{content.views.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">{content.unlocks.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">${content.revenue.toFixed(2)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 flex-1">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-600">
                  We use cookies to improve your experience and analyze site usage. By continuing, you agree to our{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCookieBanner(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowCookieBanner(false)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
