'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import RequestPayoutModal from '@/components/RequestPayoutModal';
import { earningsApi, contentApi } from '@/lib/api-client';
import FloatingLogo from '@/components/FloatingLogo';

interface Balance {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  totalPayouts: number;
}

interface Payout {
  id: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  amount: number;
}

interface PayoutsData {
  payouts: Payout[];
}

interface Transaction {
  id: string;
  type: string;
  contentTitle?: string;
  description?: string;
  buyerEmail?: string;
  recipient?: string;
  amount: number;
  paymentMethod?: string;
  date: string;
}

interface TransactionsData {
  transactions: Transaction[];
  total: number;
  totalPages: number;
}

interface ContentItem {
  id: string;
  title: string;
}

interface PayoutRequest {
  id: string;
  requestedAmount: number;
  availableBalance: number;
  currency: string;
  status: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  payout?: {
    id: string;
    amount: number;
    status: string;
  };
}

export default function EarningsPage() {
  const [timePeriod, setTimePeriod] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [contentFilter, setContentFilter] = useState('All Content');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Data state
  const [balance, setBalance] = useState<Balance | null>(null);
  const [payouts, setPayouts] = useState<PayoutsData | null>(null);
  const [transactions, setTransactions] = useState<TransactionsData | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch balance data
  const fetchBalance = async () => {
    try {
      const response = await earningsApi.getBalance();
      setBalance(response.data.data);
    } catch (err: unknown) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Fetch content items for dropdown
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentApi.getMyContent();
        setContentItems(response.data.data || []);
      } catch (err: unknown) {
        console.error('Error fetching content items:', err);
      }
    };

    fetchContent();
  }, []);

  // Fetch payouts data
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await earningsApi.getPayouts(1, 3);
        setPayouts(response.data.data);
      } catch (err: unknown) {
        console.error('Error fetching payouts:', err);
      }
    };

    fetchPayouts();
  }, []);

  // Fetch payout requests data
  const fetchPayoutRequests = async () => {
    try {
      const response = await earningsApi.getPayoutRequests();
      setPayoutRequests(response.data.data || []);
    } catch (err: unknown) {
      console.error('Error fetching payout requests:', err);
    }
  };

  useEffect(() => {
    fetchPayoutRequests();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, contentFilter, searchQuery]);

  // Fetch transactions data with debouncing
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const type = typeFilter === 'All Types' ? undefined : typeFilter.toUpperCase();
        const search = searchQuery.trim() || undefined;

        const response = await earningsApi.getTransactions(
          currentPage,
          10,
          type,
          search
        );
        setTransactions(response.data.data);
      } catch (err: unknown) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search for better UX
    const timeoutId = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, typeFilter, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTransactionTypeStyles = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return {
          typeColor: 'text-green-600',
          typeBg: 'bg-green-50',
          amountColor: 'text-green-600',
        };
      case 'PAYOUT':
        return {
          typeColor: 'text-indigo-600',
          typeBg: 'bg-indigo-50',
          amountColor: 'text-gray-900',
        };
      case 'REFUND':
        return {
          typeColor: 'text-red-600',
          typeBg: 'bg-red-50',
          amountColor: 'text-red-600',
        };
      default:
        return {
          typeColor: 'text-gray-600',
          typeBg: 'bg-gray-50',
          amountColor: 'text-gray-900',
        };
    }
  };

  const getPayoutStatusStyles = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          statusColor: 'text-green-600',
          iconBg: 'bg-green-100',
        };
      case 'PROCESSING':
        return {
          statusColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
        };
      case 'PENDING':
        return {
          statusColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
        };
      case 'FAILED':
        return {
          statusColor: 'text-red-600',
          iconBg: 'bg-red-100',
        };
      default:
        return {
          statusColor: 'text-gray-600',
          iconBg: 'bg-gray-100',
        };
    }
  };

  // Filter transactions by content
  const filteredTransactions = useMemo(() => {
    if (!transactions?.transactions) return [];

    if (contentFilter === 'All Content') {
      return transactions.transactions;
    }

    return transactions.transactions.filter((transaction: Transaction) =>
      transaction.contentTitle === contentFilter
    );
  }, [transactions, contentFilter]);

  return (
    <>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Wallet & Payouts</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your earnings and request payouts</p>
            </div>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 relative">
          {/* Floating Brand Logo */}
          <FloatingLogo
            position="top-left"
            size={100}
            animation="float"
            opacity={0.08}
          />

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Available Balance */}
            <div className="sm:col-span-2 lg:col-span-1 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm mb-1 sm:mb-2">Available Balance</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {balance ? formatCurrency(balance.availableBalance) : '$0.00'}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="w-full bg-white text-purple-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request Payout
              </button>
            </div>

            {/* Pending Balance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Pending Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {balance ? formatCurrency(balance.pendingBalance) : '$0.00'}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 sm:p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-indigo-900">24-Working Hour Buffer Rule</p>
                  <p className="text-xs text-indigo-700 mt-0.5 sm:mt-1">Funds from new purchases clear within 24 working hours</p>
                </div>
              </div>
            </div>

            {/* Total Lifetime Earnings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Total Lifetime Earnings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {balance ? formatCurrency(balance.lifetimeEarnings) : '$0.00'}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 icon-3d-container icon-3d-indigo rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-xs sm:text-sm text-gray-600">Total Payouts</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  {balance ? formatCurrency(balance.totalPayouts) : '$0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Payout Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Payout Activity</h2>
              <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All Payouts
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {!payouts || payouts.payouts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  <p>No payout activity yet</p>
                </div>
              ) : (
                payouts.payouts.map((payout: Payout) => {
                  const styles = getPayoutStatusStyles(payout.status);
                  return (
                    <div key={payout.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 ${styles.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                          {payout.status === 'COMPLETED' ? (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : payout.status === 'PROCESSING' ? (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Payout to {payout.paymentMethod || 'Bank Account'}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{formatDate(payout.createdAt)} • {formatTime(payout.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right pl-12 sm:pl-0">
                        <p className="text-base sm:text-lg font-semibold text-gray-900">{formatCurrency(payout.amount)}</p>
                        <p className={`text-xs sm:text-sm ${styles.statusColor} font-medium`}>
                          {payout.status.charAt(0) + payout.status.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Transaction History</h2>

              <div className="flex flex-col gap-3">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                {/* Filter Selects */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
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
                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option>All Content</option>
                    {contentItems.map((item) => (
                      <option key={item.id} value={item.title}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {loading ? (
                <div className="px-4 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-500 text-sm">
                  No transactions found
                </div>
              ) : (
                filteredTransactions.map((transaction: Transaction) => {
                  const styles = getTransactionTypeStyles(transaction.type);
                  return (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.contentTitle || transaction.description || 'Transaction'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {transaction.buyerEmail || transaction.recipient || 'N/A'}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold ${styles.amountColor} whitespace-nowrap`}>
                          {transaction.type === 'PAYOUT' || transaction.type === 'REFUND' ? '-' : '+'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles.typeBg} ${styles.typeColor}`}>
                            {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {transaction.paymentMethod || 'N/A'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Content Item
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Buyer/Recipient
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Method
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading transactions...
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction: Transaction) => {
                      const styles = getTransactionTypeStyles(transaction.type);
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{formatDate(transaction.date)}</p>
                              <p className="text-xs text-gray-500">{formatTime(transaction.date)}</p>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.typeBg} ${styles.typeColor}`}>
                              {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <span className="text-sm text-gray-900">
                              {transaction.contentTitle || transaction.description || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            <span className="text-sm text-gray-600">
                              {transaction.buyerEmail || transaction.recipient || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            <span className="text-sm text-gray-600">
                              {transaction.paymentMethod || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                            <span className={`text-sm font-semibold ${styles.amountColor}`}>
                              {transaction.type === 'PAYOUT' || transaction.type === 'REFUND' ? '-' : '+'}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transactions && transactions.total > 0 && (
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    {contentFilter !== 'All Content' ? (
                      <>Showing {filteredTransactions.length} filtered results</>
                    ) : (
                      <>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, transactions.total)} of {transactions.total}</>
                    )}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(3, transactions.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-medium text-xs sm:text-sm ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <span className="sm:hidden text-xs text-gray-600 px-2">
                      {currentPage} / {transactions.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= transactions.totalPages}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Request Payout Modal */}
      <RequestPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        availableBalance={balance?.availableBalance || 0}
        onSuccess={() => {
          fetchPayoutRequests();
          fetchBalance();
        }}
      />
    </>
  );
}
