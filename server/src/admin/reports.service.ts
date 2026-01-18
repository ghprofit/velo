import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatorPerformanceResponse,
  CreatorPerformanceDto,
  AnalyticsOverviewResponse,
  RevenueTrendsResponse,
  UserGrowthResponse,
  ContentPerformanceResponse,
  GeographicDistributionResponse,
} from './reports.controller';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get creator performance metrics
   */
  async getCreatorPerformance(
    limit: number,
    sortBy: 'revenue' | 'views' | 'engagement',
  ): Promise<CreatorPerformanceResponse> {
    try {
      // Get creators with their content and purchase data
      const creators = await this.prisma.creatorProfile.findMany({
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          content: {
            include: {
              purchases: {
                where: {
                  status: 'COMPLETED',
                },
                select: {
                  amount: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      // Calculate performance metrics for each creator
      const performanceData: CreatorPerformanceDto[] = creators.map((creator) => {
        const totalRevenue = creator.content.reduce(
          (sum, content) =>
            sum +
            content.purchases.reduce(
              (purchaseSum, purchase) => purchaseSum + Number(purchase.amount),
              0,
            ),
          0,
        );

        const contentCount = creator.content.length;
        const totalViews = creator.content.reduce((sum, content) => sum + (content.viewCount || 0), 0);

        // Calculate engagement rate (purchases / views) * 100
        const engagement = totalViews > 0 ? (creator.content.reduce((sum, content) => sum + content.purchases.length, 0) / totalViews) * 100 : 0;

        return {
          creatorId: creator.id,
          creatorName: creator.displayName,
          totalViews,
          totalRevenue,
          contentCount,
          engagement: Math.round(engagement * 10) / 10, // Round to 1 decimal
          category: 'Digital Content', // Default category - can be enhanced
        };
      });

      // Sort by specified field
      performanceData.sort((a, b) => {
        if (sortBy === 'revenue') {
          return b.totalRevenue - a.totalRevenue;
        } else if (sortBy === 'views') {
          return b.totalViews - a.totalViews;
        } else {
          return b.engagement - a.engagement;
        }
      });

      return {
        success: true,
        data: performanceData.slice(0, limit),
      };
    } catch (error) {
      this.logger.error('Error fetching creator performance:', error);
      throw error;
    }
  }

  /**
   * Get analytics overview with growth percentages
   */
  async getAnalyticsOverview(): Promise<AnalyticsOverviewResponse> {
    try {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Get current month stats
      const [
        currentRevenue,
        lastMonthRevenue,
        currentCreators,
        lastMonthCreators,
        currentContent,
        lastMonthContent,
        currentTransactions,
      ] = await Promise.all([
        // Current month revenue
        this.prisma.purchase.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfThisMonth },
          },
          _sum: { amount: true },
          _count: true,
        }),
        // Last month revenue
        this.prisma.purchase.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
          _sum: { amount: true },
        }),
        // Current active creators
        this.prisma.creatorProfile.count({
          where: {
            user: {
              emailVerified: true,
            },
            verificationStatus: 'VERIFIED',
          },
        }),
        // Last month active creators (approximation - creators who had content then)
        this.prisma.creatorProfile.count({
          where: {
            user: {
              emailVerified: true,
            },
            verificationStatus: 'VERIFIED',
            createdAt: { lte: endOfLastMonth },
          },
        }),
        // Current month content uploads
        this.prisma.content.count({
          where: {
            createdAt: { gte: startOfThisMonth },
          },
        }),
        // Last month content uploads
        this.prisma.content.count({
          where: {
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        // Current transactions
        this.prisma.purchase.count({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfThisMonth },
          },
        }),
      ]);

      const totalRevenue = Number(currentRevenue._sum.amount || 0);
      const lastRevenue = Number(lastMonthRevenue._sum.amount || 0);
      const revenueGrowth =
        lastRevenue > 0 ? ((totalRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      const creatorsGrowth =
        lastMonthCreators > 0
          ? ((currentCreators - lastMonthCreators) / lastMonthCreators) * 100
          : 0;

      const contentGrowth =
        lastMonthContent > 0
          ? ((currentContent - lastMonthContent) / lastMonthContent) * 100
          : 0;

      const avgTransactionValue =
        currentTransactions > 0 ? totalRevenue / currentTransactions : 0;

      return {
        success: true,
        data: {
          totalRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          activeCreators: currentCreators,
          creatorsGrowth: Math.round(creatorsGrowth * 10) / 10,
          contentUploaded: currentContent,
          contentGrowth: Math.round(contentGrowth * 10) / 10,
          avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching analytics overview:', error);
      throw error;
    }
  }

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(period: 'WEEKLY' | 'MONTHLY' | 'YEARLY'): Promise<RevenueTrendsResponse> {
    try {
      const now = new Date();
      let startDate: Date;
      let groupByFormat: string;
      let periods: string[];

      if (period === 'WEEKLY') {
        // Last 8 weeks
        startDate = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
        groupByFormat = 'week';
        periods = Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`);
      } else if (period === 'MONTHLY') {
        // Last 12 months
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupByFormat = 'month';
        periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      } else {
        // Current year by quarter
        startDate = new Date(now.getFullYear(), 0, 1);
        groupByFormat = 'quarter';
        periods = ['Q1', 'Q2', 'Q3', 'Q4'];
      }

      // Fetch purchases
      const purchases = await this.prisma.purchase.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group data by period
      const revenueData = new Map<string, number>();

      purchases.forEach((purchase) => {
        let periodKey: string;
        const purchaseDate = new Date(purchase.createdAt);

        if (period === 'WEEKLY') {
          const weeksDiff = Math.floor(
            (purchaseDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          periodKey = `Week ${weeksDiff + 1}`;
        } else if (period === 'MONTHLY') {
          periodKey = periods[purchaseDate.getMonth()]!;
        } else {
          const quarter = Math.floor(purchaseDate.getMonth() / 3);
          periodKey = `Q${quarter + 1}`;
        }

        const currentRevenue = revenueData.get(periodKey) || 0;
        revenueData.set(periodKey, currentRevenue + Number(purchase.amount));
      });

      // Format response
      const data = periods.map((period) => ({
        period,
        revenue: revenueData.get(period) || 0,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Error fetching revenue trends:', error);
      throw error;
    }
  }

  /**
   * Get user growth metrics (creators or buyers)
   */
  async getUserGrowth(userType: 'CREATORS' | 'BUYERS'): Promise<UserGrowthResponse> {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1); // Start of current year

      if (userType === 'CREATORS') {
        // Get creators grouped by month
        const creators = await this.prisma.creatorProfile.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
          },
        });

        const monthlyData = new Map<number, number>();
        creators.forEach((creator) => {
          const month = new Date(creator.createdAt).getMonth();
          monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
        });

        const data = Array.from({ length: 12 }, (_, i) => ({
          period: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]!,
          count: monthlyData.get(i) || 0,
        }));

        return { success: true, data };
      } else {
        // Get buyer sessions grouped by month
        const buyers = await this.prisma.buyerSession.findMany({
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            createdAt: true,
          },
        });

        const monthlyData = new Map<number, number>();
        buyers.forEach((buyer) => {
          const month = new Date(buyer.createdAt).getMonth();
          monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
        });

        const data = Array.from({ length: 12 }, (_, i) => ({
          period: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]!,
          count: monthlyData.get(i) || 0,
        }));

        return { success: true, data };
      }
    } catch (error) {
      this.logger.error('Error fetching user growth:', error);
      throw error;
    }
  }

  /**
   * Get content performance breakdown by type
   */
  async getContentPerformance(): Promise<ContentPerformanceResponse> {
    try {
      // Get all content grouped by type
      const contentByType = await this.prisma.content.groupBy({
        by: ['contentType'],
        _count: {
          id: true,
        },
        where: {
          status: 'APPROVED',
          isPublished: true,
        },
      });

      const total = contentByType.reduce((sum, item) => sum + item._count.id, 0);

      const data = contentByType.map((item) => ({
        contentType: item.contentType,
        count: item._count.id,
        percentage: total > 0 ? Math.round((item._count.id / total) * 100 * 10) / 10 : 0,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Error fetching content performance:', error);
      throw error;
    }
  }

  /**
   * Get geographic distribution of buyers
   */
  async getGeographicDistribution(limit: number = 10): Promise<GeographicDistributionResponse> {
    try {
      // Get content views grouped by country
      const viewsByCountry = await this.prisma.contentView.groupBy({
        by: ['country'],
        _count: {
          id: true,
        },
        where: {
          country: {
            not: null,
          },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limit,
      });

      const totalViews = viewsByCountry.reduce((sum, item) => sum + item._count.id, 0);

      const data = viewsByCountry.map((item) => ({
        country: item.country as string,
        percentage: totalViews > 0 ? Math.round((item._count.id / totalViews) * 100 * 10) / 10 : 0,
        count: item._count.id,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Error fetching geographic distribution:', error);
      throw error;
    }
  }
}
