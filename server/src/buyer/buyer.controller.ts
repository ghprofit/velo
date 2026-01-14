import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BuyerService } from './buyer.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { VerifyAccessDto } from './dto/verify-access.dto';
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto';
import { CheckEligibilityDto } from './dto/check-eligibility.dto';

@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  /**
   * Create or get buyer session
   */
  @Post('session')
  async createSession(
    @Body() dto: CreateSessionDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return this.buyerService.createOrGetSession(dto, ipAddress, userAgent);
  }

  /**
   * Get content details (public)
   */
  @Get('content/:id')
  async getContentDetails(@Param('id') id: string) {
    return this.buyerService.getContentDetails(id);
  }

  /**
   * Create a purchase
   */
  @Post('purchase')
  async createPurchase(@Body() dto: CreatePurchaseDto) {
    return this.buyerService.createPurchase(dto);
  }

  /**
   * Verify purchase status
   */
  @Get('purchase/:id')
  async verifyPurchase(@Param('id') id: string) {
    return this.buyerService.verifyPurchase(id);
  }

  /**
   * Get content access after purchase
   */
  @Post('access')
  async getContentAccess(@Body() dto: VerifyAccessDto) {
    return this.buyerService.getContentAccess(dto.accessToken);
  }

  /**
   * Check if buyer has access eligibility for content
   * Validates access token, purchase status, and device fingerprint
   */
  @Post('access/check-eligibility')
  async checkAccessEligibility(@Body() dto: CheckEligibilityDto) {
    return this.buyerService.checkAccessEligibility(dto.accessToken, dto.fingerprint);
  }

  /**
   * Get all purchases for a session
   */
  @Get('session/:sessionToken/purchases')
  async getSessionPurchases(@Param('sessionToken') sessionToken: string) {
    return this.buyerService.getSessionPurchases(sessionToken);
  }

  /**
   * Confirm purchase after payment success
   */
  @Post('purchase/confirm')
  async confirmPurchase(@Body() dto: ConfirmPurchaseDto) {
    return this.buyerService.confirmPurchase(dto.purchaseId, dto.paymentIntentId);
  }

  /**
   * Request device verification code for accessing purchase on new device
   * Rate limited to prevent spam
   */
  @Post('request-device-code')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async requestDeviceCode(
    @Body() dto: { purchaseId: string; fingerprint: string },
  ) {
    return this.buyerService.requestDeviceVerification(
      dto.purchaseId,
      dto.fingerprint,
    );
  }

  /**
   * Verify device with code to grant access on new device
   * Rate limited to prevent brute force attacks
   */
  @Post('verify-device')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async verifyDevice(
    @Body() dto: { purchaseId: string; code: string; fingerprint: string },
  ) {
    return this.buyerService.verifyDeviceCode(
      dto.purchaseId,
      dto.code,
      dto.fingerprint,
    );
  }
}
