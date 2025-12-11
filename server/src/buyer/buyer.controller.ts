import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Ip,
} from '@nestjs/common';
import { Request } from 'express';
import { BuyerService } from './buyer.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { VerifyAccessDto } from './dto/verify-access.dto';
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto';

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
}
