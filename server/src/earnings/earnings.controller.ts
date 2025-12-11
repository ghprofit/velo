import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EarningsService } from './earnings.service';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('earnings')
@UseGuards(JwtAuthGuard)
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get('balance')
  @HttpCode(HttpStatus.OK)
  async getBalance(@Request() req: AuthenticatedRequest) {
    const balance = await this.earningsService.getBalance(req.user.id);

    return {
      success: true,
      data: balance,
    };
  }

  @Get('payouts')
  @HttpCode(HttpStatus.OK)
  async getPayouts(
    @Request() req: AuthenticatedRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.earningsService.getPayouts(
      req.user.id,
      page,
      limit,
    );

    return {
      success: true,
      data: {
        payouts: result.payouts,
        pagination: result.pagination,
      },
    };
  }

  @Get('transactions')
  @HttpCode(HttpStatus.OK)
  async getTransactions(
    @Request() req: AuthenticatedRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('type') type?: 'purchase' | 'payout',
    @Query('search') search?: string,
  ) {
    const result = await this.earningsService.getTransactions(
      req.user.id,
      page,
      limit,
      type,
      search,
    );

    return {
      success: true,
      data: {
        transactions: result.transactions,
        pagination: result.pagination,
      },
    };
  }
}
