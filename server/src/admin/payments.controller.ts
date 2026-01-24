import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { AdminRoles } from '../auth/decorators/admin-roles.decorator';
import {
  QueryPaymentsDto,
  QueryPayoutsDto,
  ProcessPayoutDto,
} from './dto/payments.dto';
import { ApprovePayoutRequestDto, RejectPayoutRequestDto } from './dto/approve-payout-request.dto';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, AdminGuard, AdminRoleGuard)
@AdminRoles('FINANCIAL_ADMIN')
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

  /**
   * Get all payout requests (PENDING, APPROVED, REJECTED)
   */
  @Get('payout-requests')
  async getPayoutRequests(
    @Query('status') status?: string,
    @Query('creatorId') creatorId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getPayoutRequests({ status, creatorId, page, limit });
  }

  /**
   * Get specific payout request details
   */
  @Get('payout-requests/:id')
  async getPayoutRequestDetails(@Param('id') id: string) {
    return this.paymentsService.getPayoutRequestDetails(id);
  }

  /**
   * Approve payout request (creates Payout for Stripe processing)
   */
  @Post('payout-requests/approve')
  async approvePayoutRequest(
    @Request() req: any,
    @Body() dto: ApprovePayoutRequestDto,
  ) {
    return this.paymentsService.approvePayoutRequest(
      dto.requestId,
      req.user.id,
      dto.reviewNotes,
    );
  }

  /**
   * Reject payout request
   */
  @Post('payout-requests/reject')
  async rejectPayoutRequest(
    @Request() req: any,
    @Body() dto: RejectPayoutRequestDto,
  ) {
    return this.paymentsService.rejectPayoutRequest(
      dto.requestId,
      req.user.id,
      dto.reviewNotes,
    );
  }
}
