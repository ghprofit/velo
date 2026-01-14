import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatorPerformanceResponse,
  CreatorPerformanceDto,
  AnalyticsOverviewResponse,
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
}
