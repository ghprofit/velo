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
    console.log('[BUYER CONTROLLER] getContentAccess called with token:', dto.accessToken?.substring(0, 20) + '...');
    const result = await this.buyerService.getContentAccess(dto.accessToken);
    console.log('[BUYER CONTROLLER] getContentAccess result:', {
      contentId: result.content.id,
      contentType: result.content.contentType,
      itemsCount: result.content.contentItems?.length || 0,
      firstItemHasSignedUrl: result.content.contentItems?.[0]?.signedUrl ? 'YES' : 'NO',
      firstItemSignedUrlPreview: result.content.contentItems?.[0]?.signedUrl?.substring(0, 100),
    });
    console.log('[BUYER CONTROLLER] Full contentItems:', JSON.stringify(result.content.contentItems, null, 2));
    return result;
  }

  /**
   * Check if buyer has access eligibility for content
   * Validates access token, purchase status, and device fingerprint
   */
  @Post('access/check-eligibility')
  async checkAccessEligibility(@Body() dto: CheckEligibilityDto) {
    console.log('[BUYER CONTROLLER] checkAccessEligibility called with:', {
      hasAccessToken: !!dto.accessToken,
      accessTokenPreview: dto.accessToken?.substring(0, 20) + '...',
      hasFingerprint: !!dto.fingerprint,
      fingerprintPreview: dto.fingerprint?.substring(0, 20) + '...',
    });
    
    try {
      const result = await this.buyerService.checkAccessEligibility(dto.accessToken, dto.fingerprint);
      console.log('[BUYER CONTROLLER] checkAccessEligibility result:', result);
      return result;
    } catch (error) {
      console.error('[BUYER CONTROLLER] checkAccessEligibility error:', error);
      throw error;
    }
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
    console.log('[BUYER CONTROLLER] confirmPurchase called');
    console.log('[BUYER CONTROLLER] DTO:', JSON.stringify(dto, null, 2));
    console.log('[BUYER CONTROLLER] purchaseId:', dto.purchaseId);
    console.log('[BUYER CONTROLLER] paymentIntentId:', dto.paymentIntentId);
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

  /**
   * Resend purchase invoice/receipt email
   * Rate limited to prevent spam
   */
  @Post('invoice/resend')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
  async resendInvoice(
    @Body() dto: { purchaseId: string; email: string },
  ) {
    return this.buyerService.resendInvoice(dto.purchaseId, dto.email);
  }
}
