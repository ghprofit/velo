'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { analyticsApi } from '@/lib/api-client';

interface OverviewStats {
  totalRevenue: number;
  totalUnlocks: number;
  totalViews: number;
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
  size: string;
  views: number;
  unlocks: number;
  revenue: number;
  thumbnailUrl: string;
}

interface ContentPerformanceResponse {
  items: ContentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CountryData {
  country: string;
  countryCode: string;
  views: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  views: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  views: number;
  percentage: number;
}

interface DemographicsData {
  geographic: {
    countries: CountryData[];
    totalViews: number;
  };
  devices: {
    devices: DeviceData[];
    totalViews: number;
  };
  browsers: {
    browsers: BrowserData[];
    totalViews: number;
  };
}

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState('All Time');
  const [chartTab, setChartTab] = useState('revenue');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [demographicsTab, setDemographicsTab] = useState<'geographic' | 'devices' | 'browsers'>('geographic');

  // Data states
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalRevenue: 0,
    totalUnlocks: 0,
    totalViews: 0,
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingDemographics, setLoadingDemographics] = useState(true);

  // Fetch overview stats
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoadingOverview(true);
        const response = await analyticsApi.getOverview(timePeriod);
        // Handle wrapped response { success, data: { totalRevenue, ... } }
        const data = response.data?.data || response.data;
        setOverviewStats({
          totalRevenue: data?.totalRevenue || 0,
          totalUnlocks: data?.totalUnlocks || 0,
          totalViews: data?.totalViews || 0,
        });
      } catch (error) {
        console.error('Failed to fetch overview:', error);
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchOverview();
  }, [timePeriod]);

  // Fetch trend data
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoadingTrends(true);
        const response = await analyticsApi.getTrends(timePeriod, chartTab);
        setTrendData(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setLoadingTrends(false);
      }
    };

    fetchTrends();
  }, [timePeriod, chartTab]);

  // Fetch content performance
  useEffect(() => {
    const fetchContentPerformance = async () => {
      try {
        setLoadingContent(true);
        const response = await analyticsApi.getContentPerformance(
          currentPage,
          10,
          searchQuery
        );
        // Handle wrapped response { success, data: { items, ... } }
        const data: ContentPerformanceResponse = response.data?.data || response.data;
        setContentItems(data?.items || []);
        setTotalItems(data?.total || 0);
        setTotalPages(data?.totalPages || 0);
      } catch (error) {
        console.error('Failed to fetch content performance:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchContentPerformance();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchQuery]);

  // Fetch demographics data
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        setLoadingDemographics(true);
        const response = await analyticsApi.getDemographics(timePeriod);
        const data = response.data?.data || response.data;
        setDemographics(data);
      } catch (error) {
        console.error('Failed to fetch demographics:', error);
      } finally {
        setLoadingDemographics(false);
      }
    };

    fetchDemographics();
  }, [timePeriod]);

  // Country code to flag emoji converter
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === 'XX') return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Get device icon
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'mobile':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'tablet':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // Get browser icon
  const getBrowserIcon = (browser: string) => {
    const lowerBrowser = browser.toLowerCase();
    if (lowerBrowser.includes('chrome')) {
      return <span className="text-lg">🌐</span>;
    } else if (lowerBrowser.includes('firefox')) {
      return <span className="text-lg">🦊</span>;
    } else if (lowerBrowser.includes('safari')) {
      return <span className="text-lg">🧭</span>;
    } else if (lowerBrowser.includes('edge')) {
      return <span className="text-lg">🔷</span>;
    } else {
      return <span className="text-lg">🌐</span>;
    }
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: loadingOverview
        ? '...'
        : `$${overviewStats.totalRevenue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      icon: 'dollar',
      iconColor: 'text-indigo-500',
      link: 'View Wallet & Payouts',
    },
    {
      label: 'Total Unlocks',
      value: loadingOverview ? '...' : overviewStats.totalUnlocks.toLocaleString(),
      icon: 'unlock',
      iconColor: 'text-indigo-500',
    },
    {
      label: 'Total Views',
      value: loadingOverview ? '...' : overviewStats.totalViews.toLocaleString(),
      icon: 'eye',
      iconColor: 'text-indigo-500',
    },
  ];

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const icons: Record<string, JSX.Element> = {
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

  // Chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  // Generate chart data
  const generateChartData = () => {
    if (trendData.length === 0) return { pathData: '', areaData: '', points: [], maxValue: 0, yAxisLabels: [] };

    const metric = chartTab as keyof TrendData;
    const values = trendData.map((d) => d[metric] as number);
    const maxValue = Math.max(...values, 1);

    // Generate nice Y-axis labels
    const yAxisLabels = [];
    const step = maxValue > 0 ? Math.ceil(maxValue / 4) : 1;
    for (let i = 0; i <= 4; i++) {
      yAxisLabels.push(i * step);
    }
    const actualMax = yAxisLabels[yAxisLabels.length - 1] || 1;

    const xStep = plotWidth / (values.length - 1 || 1);
    const yScale = plotHeight / actualMax;

    const points = values.map((value, index) => ({
      x: chartPadding.left + index * xStep,
      y: chartPadding.top + plotHeight - value * yScale,
      value,
      date: trendData[index].date,
    }));

    const pathData = points.length > 0
      ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`
      : '';

    const areaData = pathData
      ? `${pathData} L ${chartPadding.left + plotWidth} ${chartPadding.top + plotHeight} L ${chartPadding.left} ${chartPadding.top + plotHeight} Z`
      : '';

    return { pathData, areaData, points, maxValue: actualMax, yAxisLabels };
  };

  const { pathData, areaData, points, maxValue, yAxisLabels } = generateChartData();

  return (
    <>
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
            <option>All Time</option>
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
                <Link href="earnings" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
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
            {loadingTrends ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : trendData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">No data available for this period</div>
              </div>
            ) : (
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {yAxisLabels.map((_, index) => {
                  const y = chartPadding.top + (plotHeight * index) / 4;
                  return (
                    <line
                      key={`grid-${index}`}
                      x1={chartPadding.left}
                      y1={y}
                      x2={chartPadding.left + plotWidth}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Y-axis labels */}
                {yAxisLabels.map((value, index) => {
                  const y = chartPadding.top + plotHeight - (plotHeight * index) / 4;
                  return (
                    <text
                      key={`y-${index}`}
                      x={chartPadding.left - 10}
                      y={y + 4}
                      className="text-xs fill-gray-500"
                      textAnchor="end"
                    >
                      {chartTab === 'revenue' ? `$${value}` : value}
                    </text>
                  );
                })}

                {/* Area fill */}
                {areaData && <path d={areaData} fill="url(#chartGradient)" />}

                {/* Line */}
                {pathData && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {points.map((point, index) => (
                  <g key={`point-${index}`}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#6366f1"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* Tooltip on hover - shown via CSS */}
                    <title>
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      : {chartTab === 'revenue' ? `$${point.value.toFixed(2)}` : point.value}
                    </title>
                  </g>
                ))}

                {/* X-axis date labels - show every few labels to avoid crowding */}
                {points.map((point, index) => {
                  // Show label every N points to avoid crowding
                  const showEvery = Math.ceil(points.length / 7);
                  if (index % showEvery !== 0 && index !== points.length - 1) return null;
                  return (
                    <text
                      key={`x-${index}`}
                      x={point.x}
                      y={chartHeight - 10}
                      className="text-xs fill-gray-500"
                      textAnchor="middle"
                    >
                      {new Date(point.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </text>
                  );
                })}
              </svg>
            )}
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading content...</div>
                </div>
              ) : contentItems.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">No content items found</div>
                </div>
              ) : (
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
                    {contentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.thumbnailUrl || 'https://via.placeholder.com/48x48?text=No+Image'}
                              alt={item.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=No+Image';
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500">
                                {item.type} • {item.size}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{item.views.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{item.unlocks.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            ${item.revenue.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/creator/content/${item.id}`}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loadingContent && contentItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * 10 + 1} to{' '}
                  {Math.min(currentPage * 10, totalItems)} of {totalItems} items
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Demographics Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Audience Demographics</h2>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setDemographicsTab('geographic')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      demographicsTab === 'geographic'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Countries
                  </button>
                  <button
                    onClick={() => setDemographicsTab('devices')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      demographicsTab === 'devices'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Devices
                  </button>
                  <button
                    onClick={() => setDemographicsTab('browsers')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      demographicsTab === 'browsers'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Browsers
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingDemographics ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading demographics...</div>
                </div>
              ) : !demographics ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">No demographics data available</div>
                </div>
              ) : (
                <>
                  {/* Geographic Tab */}
                  {demographicsTab === 'geographic' && (
                    <div className="space-y-4">
                      {demographics.geographic.countries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                          <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>No geographic data yet</p>
                          <p className="text-sm text-gray-400 mt-1">Data will appear as viewers interact with your content</p>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-500 mb-4">
                            Total tracked views: {demographics.geographic.totalViews.toLocaleString()}
                          </div>
                          {demographics.geographic.countries.map((country, index) => (
                            <div key={country.countryCode} className="flex items-center gap-4">
                              <div className="flex items-center gap-3 w-40">
                                <span className="text-2xl">{getFlagEmoji(country.countryCode)}</span>
                                <span className="text-sm font-medium text-gray-900 truncate">{country.country}</span>
                              </div>
                              <div className="flex-1">
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${country.percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="w-20 text-right">
                                <span className="text-sm font-semibold text-gray-900">{country.percentage}%</span>
                                <span className="text-xs text-gray-500 ml-1">({country.views.toLocaleString()})</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Devices Tab */}
                  {demographicsTab === 'devices' && (
                    <div className="space-y-4">
                      {demographics.devices.devices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                          <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p>No device data yet</p>
                          <p className="text-sm text-gray-400 mt-1">Data will appear as viewers interact with your content</p>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-500 mb-4">
                            Total tracked views: {demographics.devices.totalViews.toLocaleString()}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {demographics.devices.devices.map((device) => (
                              <div
                                key={device.device}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                    {getDeviceIcon(device.device)}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{device.device}</span>
                                </div>
                                <div className="flex items-end justify-between">
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900">{device.percentage}%</p>
                                    <p className="text-xs text-gray-500">{device.views.toLocaleString()} views</p>
                                  </div>
                                  <div className="w-16 h-16">
                                    <svg viewBox="0 0 36 36" className="w-full h-full">
                                      <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="3"
                                      />
                                      <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="3"
                                        strokeDasharray={`${device.percentage}, 100`}
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Browsers Tab */}
                  {demographicsTab === 'browsers' && (
                    <div className="space-y-4">
                      {demographics.browsers.browsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                          <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <p>No browser data yet</p>
                          <p className="text-sm text-gray-400 mt-1">Data will appear as viewers interact with your content</p>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-500 mb-4">
                            Total tracked views: {demographics.browsers.totalViews.toLocaleString()}
                          </div>
                          {demographics.browsers.browsers.map((browser) => (
                            <div key={browser.browser} className="flex items-center gap-4">
                              <div className="flex items-center gap-3 w-32">
                                {getBrowserIcon(browser.browser)}
                                <span className="text-sm font-medium text-gray-900 truncate">{browser.browser}</span>
                              </div>
                              <div className="flex-1">
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${browser.percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="w-20 text-right">
                                <span className="text-sm font-semibold text-gray-900">{browser.percentage}%</span>
                                <span className="text-xs text-gray-500 ml-1">({browser.views.toLocaleString()})</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
