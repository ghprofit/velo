import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { AdminRoles } from '../auth/decorators/admin-roles.decorator';
import {
  DashboardStatsResponseDto,
  GetRevenueQueryDto,
  RecentActivityResponseDto,
  RevenueResponseDto,
  TimePeriod,
} from './dto/dashboard.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard, AdminRoleGuard)
@AdminRoles('FINANCIAL_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_SPECIALIST', 'ANALYTICS_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/revenue')
  async getRevenueOverTime(
    @Query() query: GetRevenueQueryDto,
  ): Promise<RevenueResponseDto> {
    return this.adminService.getRevenueOverTime(query.period || TimePeriod.THIRTY_DAYS);
  }

  @Get('dashboard/activity')
  async getRecentActivity(): Promise<RecentActivityResponseDto> {
    return this.adminService.getRecentActivity(10);
  }
}
