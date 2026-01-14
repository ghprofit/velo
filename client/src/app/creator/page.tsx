'use client';

import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VerificationStatusBanner from '@/components/VerificationStatusBanner';
import { authApi, analyticsApi } from '@/lib/api-client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import FloatingLogo from '@/components/FloatingLogo';

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
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
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
      } catch (err: unknown) {
        console.error('Failed to fetch profile:', err);
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to load profile data');
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
        <div className="p-4 sm:p-6 lg:p-8 relative overflow-hidden">
          {/* Floating Brand Logos */}
          <FloatingLogo
            position="top-right"
            size={120}
            animation="float-rotate"
            opacity={0.08}
          />
          <FloatingLogo
            position="bottom-left"
            size={100}
            animation="pulse"
            opacity={0.06}
          />

          {/* Floating Decorative Elements */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, -30, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-2xl"
            animate={{
              x: [0, -40, 30, 0],
              y: [0, 30, -20, 0],
              scale: [1, 0.8, 1.3, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl"
            animate={{
              x: [0, 20, -15, 0],
              y: [0, -25, 15, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && profile && (
            <>
              {/* Welcome Header */}
              <motion.div 
                className="mb-6 sm:mb-8 text-center lg:text-left"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2 sm:mb-3"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  Welcome back, {profile.displayName || 'Creator'}! 🎉
                </motion.h1>
                <motion.p 
                  className="text-gray-600 text-sm sm:text-base lg:text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Here&apos;s an overview of your amazing content performance. Let&apos;s create something awesome! 🚀
                </motion.p>
              </motion.div>

              {/* Verification Status Banner */}
              <VerificationStatusBanner />

              {/* Stats Cards */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      transition: { duration: 0.3 }
                    }}
                    className="bg-gradient-to-br from-white via-white to-gray-50/50 rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 ring-1 ring-white/20"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <motion.div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center icon-3d-container ${
                          stat.icon === 'eye' ? 'icon-3d-blue' :
                          stat.icon === 'dollar' ? 'icon-3d-green' :
                          'icon-3d-purple'
                        } relative overflow-hidden`}
                        whileHover={{
                          scale: 1.1,
                          rotate: [0, -5, 5, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        {renderIcon(stat.icon, 'w-6 h-6 sm:w-7 sm:h-7 relative z-10 text-white drop-shadow-lg')}
                      </motion.div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{stat.label}</p>
                        <motion.p 
                          className="text-2xl sm:text-3xl font-bold text-gray-900"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                        >
                          {stat.value}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Earnings Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Earnings Trend</h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Chart Type Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                          chartType === 'bar'
                            ? 'bg-white shadow-sm text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Bar Chart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                          chartType === 'line'
                            ? 'bg-white shadow-sm text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Line Chart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </button>
                    </div>
                    {/* Period Selector */}
                    <select
                      value={trendPeriod}
                      onChange={(e) => setTrendPeriod(e.target.value)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="Last 7 Days">This Week</option>
                      <option value="Last 30 Days">This Month</option>
                      <option value="Last Year">This Year</option>
                      <option value="All Time">All Time</option>
                    </select>
                  </div>
                </div>

                {/* Chart Visualization */}
                <div className="h-48 sm:h-64">
                  {loadingTrends ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500">Loading chart...</div>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500">No earnings data for this period</div>
                    </div>
                  ) : chartType === 'bar' ? (
                    /* Bar Chart */
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
                  ) : (
                    /* Line Chart */
                    <div className="relative h-full w-full flex">
                      {/* Y-axis labels */}
                      <div className="flex flex-col justify-between text-xs text-gray-500 pr-2 pb-6">
                        <span>{'$'}{maxRevenue.toFixed(0)}</span>
                        <span>{'$'}{(maxRevenue * 0.5).toFixed(0)}</span>
                        <span>{'$'}0</span>
                      </div>
                      {/* Chart area */}
                      <div className="flex-1 flex flex-col">
                        {/* SVG container */}
                        <div className="flex-1 relative">
                          {/* Grid lines */}
                          <div className="absolute inset-0">
                            {[0, 50, 100].map((percent) => (
                              <div
                                key={percent}
                                className="absolute left-0 right-0 border-t border-gray-100"
                                style={{ top: `${100 - percent}%` }}
                              />
                            ))}
                          </div>
                          {/* SVG Line Chart */}
                          <svg
                            className="absolute inset-0 w-full h-full overflow-visible"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            {/* Area fill */}
                            <defs>
                              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.05" />
                              </linearGradient>
                            </defs>
                            <path
                              d={`M 0 100 ${chartData.map((d, i) => {
                                const x = chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 50;
                                const y = 100 - (maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0);
                                return `L ${x} ${y}`;
                              }).join(' ')} L 100 100 Z`}
                              fill="url(#areaGradient)"
                            />
                            {/* Line */}
                            <path
                              d={chartData.map((d, i) => {
                                const x = chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 50;
                                const y = 100 - (maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0);
                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="rgb(99, 102, 241)"
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                          {/* Data points - rendered as HTML for proper sizing */}
                          <div className="absolute inset-0">
                            {chartData.map((d, i) => {
                              const x = chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 50;
                              const y = 100 - (maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0);
                              return (
                                <div
                                  key={i}
                                  className="absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform"
                                  style={{ left: `${x}%`, top: `${y}%` }}
                                  title={`$${d.revenue.toFixed(2)}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                        {/* X-axis labels */}
                        <div className="flex justify-between pt-2">
                          {chartData.length <= 12 ? (
                            chartData.map((d, i) => (
                              <span key={i} className="text-xs text-gray-600">
                                {formatChartDate(d.date)}
                              </span>
                            ))
                          ) : (
                            chartData.filter((_, i) => i % Math.ceil(chartData.length / 10) === 0 || i === chartData.length - 1).map((d, idx) => (
                              <span key={idx} className="text-xs text-gray-600">
                                {formatChartDate(d.date)}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Legend */}
                {!loadingTrends && chartData.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Total: {'$'}{chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}</span>
                    <span>
                      Avg: {'$'}{(chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length).toFixed(2)}
                      /{trendPeriod === 'Last Year' || trendPeriod === 'All Time' ? 'month' : 'day'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Content Performance</h2>
                  <Link
                    href="/creator/analytics"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All
                  </Link>
                </div>

                {loadingContent ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="text-gray-500 text-sm sm:text-base">Loading content...</div>
                  </div>
                ) : contentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                    <div className="text-gray-500 mb-4 text-sm sm:text-base text-center">No content uploaded yet</div>
                    <Link
                      href="/creator/upload"
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Upload Your First Content
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="sm:hidden divide-y divide-gray-200">
                      {contentItems.map((content) => (
                        <div
                          key={content.id}
                          onClick={() => router.push(`/creator/content/${content.id}`)}
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <Image
                              src={content.thumbnailUrl || 'https://via.placeholder.com/48x48?text=No+Image'}
                              alt={content.title}
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=No+Image';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{content.title}</h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                {content.type}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 rounded-lg px-2 py-2">
                              <p className="text-xs text-gray-500">Views</p>
                              <p className="text-sm font-semibold text-gray-900">{content.views.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg px-2 py-2">
                              <p className="text-xs text-gray-500">Unlocks</p>
                              <p className="text-sm font-semibold text-gray-900">{content.unlocks.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg px-2 py-2">
                              <p className="text-xs text-gray-500">Revenue</p>
                              <p className="text-sm font-semibold text-green-600">${content.revenue.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
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
                                  <Image
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
                    </div>
                  </>
                )}
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
