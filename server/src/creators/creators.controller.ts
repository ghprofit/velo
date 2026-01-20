import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreatorsService } from './creators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayoutEligibleGuard } from '../auth/guards/payout-eligible.guard';
import { SetupBankAccountDto } from './dto/bank-account.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';

@Controller('creators')
@UseGuards(JwtAuthGuard)
export class CreatorsController {
  private readonly logger = new Logger(CreatorsController.name);

  constructor(private readonly creatorsService: CreatorsService) {}

  /**
   * Initiate identity verification for the authenticated creator
   * POST /api/creators/verify/initiate
   */
  @Post('verify/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateVerification(@Request() req: any) {
    this.logger.log(`Initiating verification for user: ${req.user.id}`);

    try {
      const result = await this.creatorsService.initiateVerification(req.user.id);

      return {
        success: true,
        message: 'Verification session created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to initiate verification:', error);
      throw error;
    }
  }

  /**
   * Get current verification status for authenticated creator
   * GET /api/creators/verify/status
   */
  @Get('verify/status')
  @HttpCode(HttpStatus.OK)
  async getVerificationStatus(@Request() req: any) {
    this.logger.log(`Getting verification status for user: ${req.user.id}`);

    try {
      const status = await this.creatorsService.getMyVerificationStatus(req.user.id);

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.logger.error('Failed to get verification status:', error);
      throw error;
    }
  }

  /**
   * Setup bank account for payout
   * POST /api/creators/payout/setup
   */
  @Post('payout/setup')
  @HttpCode(HttpStatus.OK)
  async setupBankAccount(@Request() req: any, @Body() bankAccountDto: SetupBankAccountDto) {
    this.logger.log(`Setting up bank account for user: ${req.user.id}`);

    try {
      const bankAccount = await this.creatorsService.setupBankAccount(req.user.id, bankAccountDto);

      return {
        success: true,
        message: 'Bank account setup completed successfully',
        data: bankAccount,
      };
    } catch (error) {
      this.logger.error('Failed to setup bank account:', error);
      throw error;
    }
  }

  /**
   * Get bank account information
   * GET /api/creators/payout/info
   */
  @Get('payout/info')
  @HttpCode(HttpStatus.OK)
  async getBankAccount(@Request() req: any) {
    this.logger.log(`Getting bank account info for user: ${req.user.id}`);

    try {
      const bankAccount = await this.creatorsService.getBankAccount(req.user.id);

      return {
        success: true,
        data: bankAccount,
      };
    } catch (error) {
      this.logger.error('Failed to get bank account:', error);
      throw error;
    }
  }

  /**
   * Delete bank account information
   * DELETE /api/creators/payout/info
   */
  @Delete('payout/info')
  @HttpCode(HttpStatus.OK)
  async deleteBankAccount(@Request() req: any) {
    this.logger.log(`Deleting bank account for user: ${req.user.id}`);

    try {
      await this.creatorsService.deleteBankAccount(req.user.id);

      return {
        success: true,
        message: 'Bank account deleted successfully',
      };
    } catch (error) {
      this.logger.error('Failed to delete bank account:', error);
      throw error;
    }
  }

  /**
   * Request a payout
   * POST /api/creators/payout/request
   * Requires: email verified, KYC verified, and bank details setup
   *
   * Security Note (Bug #9):
   * CSRF Protection: This endpoint relies on JWT authentication in Authorization header.
   * Since browsers don't send custom headers in cross-origin requests, this provides
   * CSRF protection. Additional throttling (3 req/hour) limits abuse potential.
   *
   * TODO: For enhanced security, consider:
   * 1. Moving JWT to HTTP-only cookies with SameSite=Strict
   * 2. Implementing double-submit cookie pattern
   * 3. Adding custom CSRF token validation
   */
  @Post('payout/request')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PayoutEligibleGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 payout requests per hour
  async requestPayout(@Request() req: any, @Body() requestPayoutDto: RequestPayoutDto) {
    this.logger.log(`Payout request from user: ${req.user.id}`);

    try {
      const result = await this.creatorsService.requestPayout(req.user.id, requestPayoutDto.amount);

      return {
        success: true,
        message: result.message,
        data: {
          id: result.id,
          requestedAmount: result.requestedAmount,
          availableBalance: result.availableBalance,
          currency: result.currency,
          status: result.status,
          createdAt: result.createdAt,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create payout request:', error);
      throw error;
    }
  }

  /**
   * Get all payout requests for the authenticated creator
   * GET /api/creators/payout/requests
   */
  @Get('payout/requests')
  @HttpCode(HttpStatus.OK)
  async getPayoutRequests(@Request() req: any) {
    this.logger.log(`Getting payout requests for user: ${req.user.id}`);

    try {
      const requests = await this.creatorsService.getPayoutRequests(req.user.id);

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      this.logger.error('Failed to get payout requests:', error);
      throw error;
    }
  }

  /**
   * Get a specific payout request by ID
   * GET /api/creators/payout/requests/:id
   */
  @Get('payout/requests/:id')
  @HttpCode(HttpStatus.OK)
  async getPayoutRequestById(@Request() req: any, @Param('id') requestId: string) {
    this.logger.log(`Getting payout request ${requestId} for user: ${req.user.id}`);

    try {
      const request = await this.creatorsService.getPayoutRequestById(req.user.id, requestId);

      return {
        success: true,
        data: request,
      };
    } catch (error) {
      this.logger.error('Failed to get payout request:', error);
      throw error;
    }
  }

  /**
   * Get Stripe Connect onboarding link
   * GET /api/creators/payout/stripe-onboarding
   */
  @Get('payout/stripe-onboarding')
  @HttpCode(HttpStatus.OK)
  async getStripeOnboardingLink(@Request() req: any) {
    this.logger.log(`Getting Stripe onboarding link for user: ${req.user.id}`);

    try {
      const result = await this.creatorsService.getStripeOnboardingLink(req.user.id);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get Stripe onboarding link:', error);
      throw error;
    }
  }

  /**
   * Get Stripe account status
   * GET /api/creators/payout/stripe-status
   */
  @Get('payout/stripe-status')
  @HttpCode(HttpStatus.OK)
  async getStripeAccountStatus(@Request() req: any) {
    this.logger.log(`Getting Stripe account status for user: ${req.user.id}`);

    try {
      const result = await this.creatorsService.getStripeAccountStatus(req.user.id);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get Stripe account status:', error);
      throw error;
    }
  }
}