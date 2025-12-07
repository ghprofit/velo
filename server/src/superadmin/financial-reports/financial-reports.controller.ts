import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinancialReportsService } from './financial-reports.service';
import { QueryFinancialReportsDto } from './dto/query-financial-reports.dto';
import { SuperAdminGuard } from '../guards/superadmin.guard';

@Controller('superadmin/financial-reports')
@UseGuards(SuperAdminGuard)
export class FinancialReportsController {
  constructor(private readonly financialReportsService: FinancialReportsService) {}

  @Get('overview')
  async getFinancialOverview(@Query() query: QueryFinancialReportsDto) {
    return this.financialReportsService.getFinancialOverview(query);
  }

  @Get('revenue')
  async getRevenueReport(@Query() query: QueryFinancialReportsDto) {
    return this.financialReportsService.getRevenueReport(query);
  }

  @Get('payouts')
  async getPayoutReport(@Query() query: QueryFinancialReportsDto) {
    return this.financialReportsService.getPayoutReport(query);
  }

  @Get('analytics')
  async getRevenueAnalytics(@Query() query: QueryFinancialReportsDto) {
    return this.financialReportsService.getRevenueAnalytics(query);
  }

  @Get('payout-stats')
  async getPayoutStats() {
    return this.financialReportsService.getPayoutStats();
  }

  @Get('creator-earnings')
  async getCreatorEarnings(@Query() query: QueryFinancialReportsDto) {
    return this.financialReportsService.getCreatorEarnings(query);
  }
}
