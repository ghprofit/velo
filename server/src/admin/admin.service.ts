import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardStatsResponseDto,
  RevenueResponseDto,
  RecentActivityResponseDto,
  TimePeriod,
} from './dto/dashboard.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    // Get total creators count
    const totalCreators = await this.prisma.creatorProfile.count();

    // Get active creators count (need to join with User table)
    const activeCreators = await this.prisma.creatorProfile.count({
      where: {
        user: {
          isActive: true
        }
      },
    });

    // Get inactive creators count
    const inactiveCreators = totalCreators - activeCreators;

    // Get total earnings (sum of all creator totalEarnings)
    const earningsAggregate = await this.prisma.creatorProfile.aggregate({
      _sum: {
        totalEarnings: true,
      },
    });
    const totalEarnings = earningsAggregate._sum?.totalEarnings || 0;

    // Get today's payouts count (using Payout model as Transaction doesn't exist)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactionsToday = await this.prisma.payout.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      totalCreators,
      activeCreators,
      inactiveCreators,
      totalEarnings: Math.round(totalEarnings),
      transactionsToday,
    };
  }

  async getRevenueOverTime(period: TimePeriod): Promise<RevenueResponseDto> {
    const days = parseInt(period);
    const data = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Generate data points for each day in the period
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get sum of completed purchases for this day
      const dayRevenue = await this.prisma.purchase.aggregate({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      });

      data.push({
        date: date.toISOString().split('T')[0] as string,
        amount: dayRevenue._sum?.amount || 0,
      });
    }

    return {
      data,
      period: `${days} days`,
    };
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivityResponseDto> {
    // Get recent payouts with creator info
    const recentPayouts = await this.prisma.payout.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });

    const activities = recentPayouts.map((payout) => {
      let status = 'Pending';
      let statusColor = 'bg-yellow-100 text-yellow-700';
      const activity = `Requested payout of $${payout.amount}`;

      switch (payout.status) {
        case 'COMPLETED':
          status = 'Active';
          statusColor = 'bg-green-100 text-green-700';
          break;
        case 'FAILED':
          status = 'Failed';
          statusColor = 'bg-red-100 text-red-700';
          break;
        case 'PENDING':
          status = 'Pending';
          statusColor = 'bg-yellow-100 text-yellow-700';
          break;
        case 'PROCESSING':
          status = 'Processing';
          statusColor = 'bg-blue-100 text-blue-700';
          break;
      }

      return {
        id: payout.id,
        creator: payout.creator?.displayName || 'Unknown',
        activity,
        date: payout.createdAt.toISOString(),
        status,
        statusColor,
      };
    });

    return { data: activities };
  }
}
