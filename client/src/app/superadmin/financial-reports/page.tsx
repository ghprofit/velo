'use client';

import { useState } from 'react';
import {
  useGetFinancialOverviewQuery,
  useGetRevenueReportQuery,
  useGetPayoutReportQuery,
  useGetPayoutStatsQuery,
  useGetCreatorEarningsQuery,
} from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function FinancialReportsPage() {
  const [timeRange, setTimeRange] = useState<'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM'>('LAST_30_DAYS');
  const [reportType, setReportType] = useState<'REVENUE' | 'PAYOUTS' | 'CREATOR_EARNINGS'>('REVENUE');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch overview data
  const { data: overview, isLoading: overviewLoading } = useGetFinancialOverviewQuery({
    timeRange,
  });

  // Fetch payout stats
  const { data: payoutStats } = useGetPayoutStatsQuery();

  // Fetch report data based on type
  const { data: revenueReport, isLoading: revenueLoading } = useGetRevenueReportQuery(
    {
      timeRange,
      page,
      limit,
    },
    { skip: reportType !== 'REVENUE' }
  );

  const { data: payoutReport, isLoading: payoutLoading } = useGetPayoutReportQuery(
    {
      timeRange,
      page,
      limit,
      status: statusFilter || undefined,
    },
    { skip: reportType !== 'PAYOUTS' }
  );

  const { data: creatorEarnings, isLoading: earningsLoading } = useGetCreatorEarningsQuery(
    {
      page,
      limit,
    },
    { skip: reportType !== 'CREATOR_EARNINGS' }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
      PENDING: 'default',
      PROCESSING: 'secondary',
      COMPLETED: 'default',
      FAILED: 'destructive',
    };
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="YESTERDAY">Yesterday</SelectItem>
              <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
              <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
              <SelectItem value="LAST_MONTH">Last Month</SelectItem>
              <SelectItem value="THIS_YEAR">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      {overviewLoading ? (
        <div className="text-center py-8">Loading overview...</div>
      ) : overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {overview.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.totalPayouts)}</div>
              <p className="text-xs text-muted-foreground">Paid to creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.platformRevenue)}</div>
              <p className="text-xs text-muted-foreground">Net platform earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.pendingPayoutsAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {overview.pendingPayoutsCount} pending requests
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Payout Statistics */}
      {payoutStats && (
        <Card>
          <CardHeader>
            <CardTitle>Payout Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(payoutStats.pending.amount)}</p>
                <p className="text-xs text-muted-foreground">{payoutStats.pending.count} requests</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{formatCurrency(payoutStats.processing.amount)}</p>
                <p className="text-xs text-muted-foreground">{payoutStats.processing.count} requests</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{formatCurrency(payoutStats.completed.amount)}</p>
                <p className="text-xs text-muted-foreground">{payoutStats.completed.count} requests</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{formatCurrency(payoutStats.failed.amount)}</p>
                <p className="text-xs text-muted-foreground">{payoutStats.failed.count} requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Creators */}
      {overview?.topCreators && overview.topCreators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Earning Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.topCreators.map((creator, index) => (
                <div key={creator.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{creator.name}</p>
                      <p className="text-xs text-muted-foreground">{creator.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(creator.totalEarnings)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Type Selector */}
      <div className="flex gap-2">
        <Button
          variant={reportType === 'REVENUE' ? 'default' : 'outline'}
          onClick={() => {
            setReportType('REVENUE');
            setPage(1);
          }}
        >
          Revenue Transactions
        </Button>
        <Button
          variant={reportType === 'PAYOUTS' ? 'default' : 'outline'}
          onClick={() => {
            setReportType('PAYOUTS');
            setPage(1);
          }}
        >
          Payout Records
        </Button>
        <Button
          variant={reportType === 'CREATOR_EARNINGS' ? 'default' : 'outline'}
          onClick={() => {
            setReportType('CREATOR_EARNINGS');
            setPage(1);
          }}
        >
          Creator Earnings
        </Button>
      </div>

      {/* Filters */}
      {reportType === 'PAYOUTS' && (
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          {reportType === 'REVENUE' && (
            <>
              {revenueLoading ? (
                <div className="text-center py-8">Loading revenue data...</div>
              ) : revenueReport && revenueReport.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueReport.data.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-xs">
                            {transaction.transactionId || transaction.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{transaction.content.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(transaction.content.price)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{transaction.creator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.creator.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>{transaction.paymentProvider}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, revenueReport.pagination.total)} of{' '}
                      {revenueReport.pagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= revenueReport.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No revenue data available</div>
              )}
            </>
          )}

          {reportType === 'PAYOUTS' && (
            <>
              {payoutLoading ? (
                <div className="text-center py-8">Loading payout data...</div>
              ) : payoutReport && payoutReport.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payout ID</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processed</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutReport.data.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-mono text-xs">
                            {payout.paymentId || payout.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payout.creator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {payout.creator.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(payout.amount)}
                          </TableCell>
                          <TableCell>{payout.paymentMethod}</TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell>
                            {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                          </TableCell>
                          <TableCell>{formatDate(payout.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, payoutReport.pagination.total)} of{' '}
                      {payoutReport.pagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= payoutReport.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No payout data available</div>
              )}
            </>
          )}

          {reportType === 'CREATOR_EARNINGS' && (
            <>
              {earningsLoading ? (
                <div className="text-center py-8">Loading creator earnings...</div>
              ) : creatorEarnings && creatorEarnings.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Creator</TableHead>
                        <TableHead>Total Earnings</TableHead>
                        <TableHead>Purchases</TableHead>
                        <TableHead>Payouts</TableHead>
                        <TableHead>Payout Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creatorEarnings.data.map((creator) => (
                        <TableRow key={creator.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{creator.name}</p>
                              <p className="text-xs text-muted-foreground">{creator.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(creator.totalEarnings)}
                          </TableCell>
                          <TableCell>{creator.totalPurchases}</TableCell>
                          <TableCell>{creator.totalPayouts}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                creator.payoutStatus === 'ACTIVE'
                                  ? 'default'
                                  : creator.payoutStatus === 'SUSPENDED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {creator.payoutStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, creatorEarnings.pagination.total)} of{' '}
                      {creatorEarnings.pagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= creatorEarnings.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No creator earnings data available</div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
