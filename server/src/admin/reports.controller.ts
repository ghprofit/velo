import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

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

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminGuard)
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
}
