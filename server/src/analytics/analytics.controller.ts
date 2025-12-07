import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
  Headers,
  Ip,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getOverview(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ) {
    const userId = req.user.id;
    const data = await this.analyticsService.getCreatorOverview(userId, period);
    return {
      success: true,
      data,
    };
  }

  @Get('trends')
  @UseGuards(JwtAuthGuard)
  async getTrends(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: string,
    @Query('metric') metric?: string,
  ) {
    const userId = req.user.id;
    const result = await this.analyticsService.getPerformanceTrends(
      userId,
      period,
      metric,
    );
    return {
      success: true,
      data: result.data,
      metric: result.metric,
    };
  }

  @Get('content-performance')
  @UseGuards(JwtAuthGuard)
  async getContentPerformance(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const userId = req.user.id;
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    const data = await this.analyticsService.getContentPerformance(userId, {
      page: pageNum,
      limit: limitNum,
      search,
    });

    return {
      success: true,
      data,
    };
  }

  @Get('demographics')
  @UseGuards(JwtAuthGuard)
  async getDemographics(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ) {
    const userId = req.user.id;
    const data = await this.analyticsService.getDemographics(userId, period);
    return {
      success: true,
      data,
    };
  }

  @Get('demographics/geographic')
  @UseGuards(JwtAuthGuard)
  async getGeographicDistribution(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ) {
    const userId = req.user.id;
    const data = await this.analyticsService.getGeographicDistribution(
      userId,
      period,
    );
    return {
      success: true,
      data,
    };
  }

  @Get('demographics/devices')
  @UseGuards(JwtAuthGuard)
  async getDeviceDistribution(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ) {
    const userId = req.user.id;
    const data = await this.analyticsService.getDeviceDistribution(
      userId,
      period,
    );
    return {
      success: true,
      data,
    };
  }

  @Get('demographics/browsers')
  @UseGuards(JwtAuthGuard)
  async getBrowserDistribution(
    @Request() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ) {
    const userId = req.user.id;
    const data = await this.analyticsService.getBrowserDistribution(
      userId,
      period,
    );
    return {
      success: true,
      data,
    };
  }

  @Post('view/:contentId')
  async recordView(
    @Param('contentId') contentId: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Headers('referer') referrer: string,
    @Body()
    body: {
      country?: string;
      countryCode?: string;
      region?: string;
      city?: string;
      deviceType?: string;
      browser?: string;
      os?: string;
    },
  ) {
    await this.analyticsService.recordContentView(contentId, {
      ipAddress: ip,
      userAgent,
      referrer,
      ...body,
    });

    return {
      success: true,
      message: 'View recorded',
    };
  }
}
