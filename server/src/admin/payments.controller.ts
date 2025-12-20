import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  QueryPaymentsDto,
  QueryPayoutsDto,
  ProcessPayoutDto,
} from './dto/payments.dto';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('stats')
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get('transactions')
  async getTransactions(@Query() query: QueryPaymentsDto) {
    return this.paymentsService.getTransactions(query);
  }

  @Get('transactions/:id')
  async getTransactionById(@Param('id') id: string) {
    return this.paymentsService.getTransactionById(id);
  }

  @Get('payouts')
  async getPayouts(@Query() query: QueryPayoutsDto) {
    return this.paymentsService.getPayouts(query);
  }

  @Post('payouts/process')
  async processPayout(@Body() body: ProcessPayoutDto) {
    return this.paymentsService.processPayout(body.payoutId);
  }

  @Get('revenue-chart')
  async getRevenueChart(@Query('period') period: 'weekly' | 'monthly' | 'yearly') {
    return this.paymentsService.getRevenueChart(period || 'monthly');
  }
}
