import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetupBankAccountDto } from './dto/bank-account.dto';

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
}
