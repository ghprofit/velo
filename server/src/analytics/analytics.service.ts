import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get creator's analytics overview (total stats)
   */
  async getCreatorOverview(userId: string, period?: string) {
    // Get creator profile
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      return {
        totalRevenue: 0,
        totalUnlocks: 0,
        totalViews: 0,
      };
    }

    // Calculate date range for period (null means all time)
    const dateRange = this.getDateRange(period);

    // Build purchase query - apply date filter only if not "All Time"
    const purchaseWhere: any = {
      content: {
        creatorId: creator.id,
      },
      status: 'COMPLETED',
    };

    if (dateRange) {
      purchaseWhere.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    // Get purchases for revenue and unlock count
    const purchases = await this.prisma.purchase.findMany({
      where: purchaseWhere,
      select: {
        amount: true,
      },
    });

    // Calculate totals
    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const totalUnlocks = purchases.length;

    // Get all content for this creator to sum views
    // Views are cumulative totals, not filtered by date
    const contents = await this.prisma.content.findMany({
      where: {
        creatorId: creator.id,
      },
      select: {
        viewCount: true,
      },
    });

    const totalViews = contents.reduce((sum, c) => sum + c.viewCount, 0);

    return {
      totalRevenue,
      totalUnlocks,
      totalViews,
    };
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(userId: string, period?: string, metric?: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      return { data: [], metric: metric || 'revenue' };
    }

    // Handle "All Time" specially - get date range from actual data
    let dateRange = this.getDateRange(period);
    if (!dateRange) {
      // For "All Time", find the oldest purchase to determine the start date
      const oldestPurchase = await this.prisma.purchase.findFirst({
        where: {
          content: {
            creatorId: creator.id,
          },
          status: 'COMPLETED',
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true,
        },
      });

      const now = new Date();
      if (oldestPurchase) {
        // Start from oldest purchase date
        const startDate = new Date(oldestPurchase.createdAt);
        startDate.setHours(0, 0, 0, 0);
        dateRange = { startDate, endDate: now };
      } else {
        // No purchases, default to last 30 days
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        dateRange = { startDate, endDate: now };
      }
    }
    const days = this.getDaysInRange(dateRange);

    // Get purchases grouped by day
    const purchases = await this.prisma.purchase.findMany({
      where: {
        content: {
          creatorId: creator.id,
        },
        status: 'COMPLETED',
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group data by day
    const trendData = days.map((date) => {
      const dayPurchases = purchases.filter((p) => {
        const purchaseDate = new Date(p.createdAt).toDateString();
        return purchaseDate === date.toDateString();
      });

      const revenue = dayPurchases.reduce((sum, p) => sum + p.amount, 0);
      const unlocks = dayPurchases.length;

      return {
        date: date.toISOString().split('T')[0],
        revenue,
        unlocks,
        views: 0, // Views are not tracked per day in current schema
      };
    });

    return {
      data: trendData,
      metric: metric || 'revenue',
    };
  }

  /**
   * Get content performance details
   */
  async getContentPerformance(
    userId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
    },
  ) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      return {
        items: [],
        total: 0,
        page: options.page,
        limit: options.limit,
        totalPages: 0,
      };
    }

    const skip = (options.page - 1) * options.limit;

    // Build where clause
    const where: any = {
      creatorId: creator.id,
      isPublished: true,
    };

    if (options.search) {
      where.title = {
        contains: options.search,
        mode: 'insensitive',
      };
    }

    // Get total count
    const total = await this.prisma.content.count({ where });

    // Get content items
    const contents = await this.prisma.content.findMany({
      where,
      select: {
        id: true,
        title: true,
        contentType: true,
        fileSize: true,
        viewCount: true,
        purchaseCount: true,
        totalRevenue: true,
        thumbnailUrl: true,
      },
      orderBy: {
        totalRevenue: 'desc',
      },
      skip,
      take: options.limit,
    });

    // Format response
    const items = contents.map((content) => ({
      id: content.id,
      title: content.title,
      type: content.contentType,
      size: this.formatFileSize(content.fileSize),
      views: content.viewCount,
      unlocks: content.purchaseCount,
      revenue: content.totalRevenue,
      thumbnailUrl: content.thumbnailUrl,
    }));

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  /**
   * Helper: Get date range based on period
   * Returns null for "All Time" to indicate no date filtering
   */
  private getDateRange(period?: string): { startDate: Date; endDate: Date } | null {
    // Return null for "All Time" or undefined/empty - means no date filtering
    if (!period || period === 'All Time') {
      return null;
    }

    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);

    switch (period) {
      case 'Last 7 Days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Last 30 Days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'Last 3 Months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'Last Year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        // For unknown periods, return null (no filtering)
        return null;
    }

    return { startDate, endDate };
  }

  /**
   * Helper: Get array of dates in range
   */
  private getDaysInRange(dateRange: { startDate: Date; endDate: Date }): Date[] {
    const days: Date[] = [];
    const current = new Date(dateRange.startDate);

    while (current <= dateRange.endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  /**
   * Helper: Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get geographic distribution of views
   */
  async getGeographicDistribution(userId: string, period?: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      return { countries: [], totalViews: 0 };
    }

    // Get all content IDs for this creator
    const contents = await this.prisma.content.findMany({
      where: { creatorId: creator.id },
      select: { id: true },
    });

    const contentIds = contents.map((c) => c.id);

    if (contentIds.length === 0) {
      return { countries: [], totalViews: 0 };
    }

    // Build date filter
    const dateRange = this.getDateRange(period);
    const whereClause: any = {
      contentId: { in: contentIds },
      country: { not: null },
    };

    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    // Group views by country
    const countryViews = await this.prisma.contentView.groupBy({
      by: ['country', 'countryCode'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get total views for percentage calculation
    const totalViews = await this.prisma.contentView.count({
      where: {
        contentId: { in: contentIds },
        ...(dateRange && {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }),
      },
    });

    // Format response with percentages
    const countries = countryViews.map((cv) => ({
      country: cv.country || 'Unknown',
      countryCode: cv.countryCode || 'XX',
      views: cv._count.id,
      percentage: totalViews > 0 ? Math.round((cv._count.id / totalViews) * 100) : 0,
    }));

    return {
      countries,
      totalViews,
    };
  }

  /**
   * Get device distribution of views
   */
  async getDeviceDistribution(userId: string, period?: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      return { devices: [], totalViews: 0 };
    }

    // Get all content IDs for this creator
    const contents = await this.prisma.content.findMany({
      where: { creatorId: creator.id },
      select: { id: true },
    });

    const contentIds = contents.map((c) => c.id);

    if (contentIds.length === 0) {
      return { devices: [], totalViews: 0 };
    }

    // Build date filter
    const dateRange = this.getDateRange(period);
    const whereClause: any = {
      contentId: { in: contentIds },
      deviceType: { not: null },
    };

    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    // Group views by device type
    const deviceViews = await this.prisma.contentView.groupBy({
      by: ['deviceType'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get total views for percentage calculation
    const totalViews = await this.prisma.contentView.count({
      where: {
        contentId: { in: contentIds },
        ...(dateRange && {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }),
      },
    });

    // Format response
    const devices = deviceViews.map((dv) => ({
      device: this.formatDeviceType(dv.deviceType || 'unknown'),
      views: dv._count.id,
      percentage: totalViews > 0 ? Math.round((dv._count.id / totalViews) * 100) : 0,
    }));

    return {
      devices,
      totalViews,
    };
  }

  /**
   * Get browser distribution of views
   */
  async getBrowserDistribution(userId: string, period?: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      return { browsers: [], totalViews: 0 };
    }

    // Get all content IDs for this creator
    const contents = await this.prisma.content.findMany({
      where: { creatorId: creator.id },
      select: { id: true },
    });

    const contentIds = contents.map((c) => c.id);

    if (contentIds.length === 0) {
      return { browsers: [], totalViews: 0 };
    }

    // Build date filter
    const dateRange = this.getDateRange(period);
    const whereClause: any = {
      contentId: { in: contentIds },
      browser: { not: null },
    };

    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    // Group views by browser
    const browserViews = await this.prisma.contentView.groupBy({
      by: ['browser'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get total views
    const totalViews = await this.prisma.contentView.count({
      where: {
        contentId: { in: contentIds },
        ...(dateRange && {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }),
      },
    });

    // Format response
    const browsers = browserViews.map((bv) => ({
      browser: bv.browser || 'Unknown',
      views: bv._count.id,
      percentage: totalViews > 0 ? Math.round((bv._count.id / totalViews) * 100) : 0,
    }));

    return {
      browsers,
      totalViews,
    };
  }

  /**
   * Get complete demographics overview
   */
  async getDemographics(userId: string, period?: string) {
    const [geographic, devices, browsers] = await Promise.all([
      this.getGeographicDistribution(userId, period),
      this.getDeviceDistribution(userId, period),
      this.getBrowserDistribution(userId, period),
    ]);

    return {
      geographic,
      devices,
      browsers,
    };
  }

  /**
   * Record a content view with geographic/device data
   */
  async recordContentView(
    contentId: string,
    viewData: {
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
      country?: string;
      countryCode?: string;
      region?: string;
      city?: string;
      deviceType?: string;
      browser?: string;
      os?: string;
    },
  ) {
    // First increment the view count on the content
    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        viewCount: { increment: 1 },
      },
    });

    // Update creator's total views
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: { creatorId: true },
    });

    if (content) {
      await this.prisma.creatorProfile.update({
        where: { id: content.creatorId },
        data: {
          totalViews: { increment: 1 },
        },
      });
    }

    // Create the view record with demographic data
    return this.prisma.contentView.create({
      data: {
        contentId,
        ipAddress: viewData.ipAddress,
        userAgent: viewData.userAgent,
        referrer: viewData.referrer,
        country: viewData.country,
        countryCode: viewData.countryCode,
        region: viewData.region,
        city: viewData.city,
        deviceType: viewData.deviceType,
        browser: viewData.browser,
        os: viewData.os,
      },
    });
  }

  /**
   * Helper: Format device type for display
   */
  private formatDeviceType(deviceType: string): string {
    const types: Record<string, string> = {
      desktop: 'Desktop',
      mobile: 'Mobile',
      tablet: 'Tablet',
      unknown: 'Unknown',
    };
    return types[deviceType.toLowerCase()] || deviceType;
  }
}
