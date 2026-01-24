import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { AdminRoles } from '../auth/decorators/admin-roles.decorator';

export interface CreatorPerformanceDto {
  creatorId: string;
  creatorName: string;
  totalViews: number;
  totalRevenue: number;
  contentCount: number;
  engagement: number;
  category: string;
}

export interface CreatorPerformanceResponse {
  success: boolean;
  data: CreatorPerformanceDto[];
}

export interface AnalyticsOverviewDto {
  totalRevenue: number;
  revenueGrowth: number;
  activeCreators: number;
  creatorsGrowth: number;
  contentUploaded: number;
  contentGrowth: number;
  avgTransactionValue: number;
}

export interface AnalyticsOverviewResponse {
  success: boolean;
  data: AnalyticsOverviewDto;
}

export interface RevenueTrendDto {
  period: string;
  revenue: number;
}

export interface RevenueTrendsResponse {
  success: boolean;
  data: RevenueTrendDto[];
}

export interface UserGrowthDto {
  period: string;
  count: number;
}

export interface UserGrowthResponse {
  success: boolean;
  data: UserGrowthDto[];
}

export interface ContentPerformanceDto {
  contentType: string;
  count: number;
  percentage: number;
}

export interface ContentPerformanceResponse {
  success: boolean;
  data: ContentPerformanceDto[];
}

export interface GeographicDistributionDto {
  country: string;
  percentage: number;
  count: number;
}

export interface GeographicDistributionResponse {
  success: boolean;
  data: GeographicDistributionDto[];
}

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminGuard, AdminRoleGuard)
@AdminRoles('ANALYTICS_ADMIN', 'FINANCIAL_ADMIN')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Get creator performance metrics for reports page
   */
  @Get('creator-performance')
  async getCreatorPerformance(
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'revenue' | 'views' | 'engagement',
  ): Promise<CreatorPerformanceResponse> {
    return this.reportsService.getCreatorPerformance(limit || 10, sortBy || 'revenue');
  }

  /**
   * Get analytics overview with growth percentages
   */
  @Get('analytics-overview')
  async getAnalyticsOverview(): Promise<AnalyticsOverviewResponse> {
    return this.reportsService.getAnalyticsOverview();
  }

  /**
   * Get revenue trends over time
   */
  @Get('revenue-trends')
  async getRevenueTrends(
    @Query('period') period?: 'WEEKLY' | 'MONTHLY' | 'YEARLY',
  ): Promise<RevenueTrendsResponse> {
    return this.reportsService.getRevenueTrends(period || 'MONTHLY');
  }

  /**
   * Get user growth metrics
   */
  @Get('user-growth')
  async getUserGrowth(
    @Query('userType') userType?: 'CREATORS' | 'BUYERS',
  ): Promise<UserGrowthResponse> {
    return this.reportsService.getUserGrowth(userType || 'CREATORS');
  }

  /**
   * Get content performance breakdown
   */
  @Get('content-performance')
  async getContentPerformance(): Promise<ContentPerformanceResponse> {
    return this.reportsService.getContentPerformance();
  }

  /**
   * Get geographic distribution
   */
  @Get('geographic-distribution')
  async getGeographicDistribution(
    @Query('limit') limit?: number,
  ): Promise<GeographicDistributionResponse> {
    return this.reportsService.getGeographicDistribution(limit || 10);
  }
}
