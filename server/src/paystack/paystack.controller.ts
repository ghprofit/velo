import {
  Controller,
  Get,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PaystackService } from './paystack.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { ConfigService } from '@nestjs/config';

@Controller('paystack')
export class PaystackController {
  private readonly logger = new Logger(PaystackController.name);

  constructor(
    private paystackService: PaystackService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private config: ConfigService,
  ) {}

  /**
   * Webhook verification test endpoint
   */
  @Get('test')
  test() {
    this.logger.log('Paystack test endpoint called');
    return {
      ok: true,
      message: 'Paystack webhook test endpoint is reachable',
    };
  }

  /**
   * Handle Paystack webhooks
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const webhookStartTime = Date.now();
    const rawBody = request.rawBody;

    if (!rawBody) {
      this.logger.error('No raw body found in webhook request');
      throw new BadRequestException('Invalid request body');
    }

    if (!signature) {
      this.logger.error('No x-paystack-signature header found');
      throw new BadRequestException('Missing signature header');
    }

    this.logger.log('Paystack webhook signature:', signature);

    // Verify Paystack webhook signature
    try {
      if (!this.paystackService.verifyWebhookSignature(rawBody, signature)) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
      this.logger.log('Paystack webhook signature validated successfully');
    } catch (err) {
      this.logger.error('Paystack webhook verification failed:', err);
      throw new UnauthorizedException('Webhook signature verification failed');
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString());
    } catch (error) {
      this.logger.error('Failed to parse webhook payload:', error);
      throw new BadRequestException('Invalid webhook payload');
    }

    this.logger.log(`Paystack webhook received: ${event.event}`);

    try {
      switch (event.event) {
        case 'charge.success':
          await this.handleChargeSuccess(event.data);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.event}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.event}:`, error);
      // Return 200 to Paystack even on error to prevent retries
    }

    const webhookDuration = Date.now() - webhookStartTime;
    this.logger.log(`Paystack webhook ${event.event} processed in ${webhookDuration}ms`);

    return { received: true };
  }

  /**
   * Handle successful charge (webhook-based confirmation)
   */
  private async handleChargeSuccess(chargeData: any) {
    this.logger.log(`Paystack charge succeeded: ${chargeData.reference}`);

    const reference = chargeData.reference;

    try {
      // Find the purchase by reference
      const purchase = await this.prisma.purchase.findFirst({
        where: { paymentIntentId: reference },
        include: {
          content: {
            include: {
              creator: {
                include: { user: true },
              },
            },
          },
          buyerSession: true,
        },
      });

      if (!purchase) {
        this.logger.warn(`Purchase not found for Paystack reference: ${reference}`);
        return;
      }

      if (purchase.status === 'COMPLETED') {
        this.logger.log(`Purchase ${purchase.id} already completed`);
        return;
      }

      // Update purchase status
      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      this.logger.log(`Purchase ${purchase.id} marked as completed`);

      // Send confirmation email to buyer
      if (purchase.buyerSession.email) {
        try {
          await this.emailService.sendPurchaseConfirmation(
            purchase.buyerSession.email,
            purchase.content.title,
            purchase.amount,
            purchase.accessToken,
          );
          this.logger.log(`Confirmation email sent to ${purchase.buyerSession.email}`);
        } catch (emailError) {
          this.logger.error('Failed to send confirmation email:', emailError);
        }
      }

      // Send notification to buyer
      try {
        await this.notificationsService.createNotification({
          userId: purchase.buyerSession.id,
          type: NotificationType.PURCHASE_COMPLETED,
          title: 'Purchase Completed',
          message: `Your purchase of "${purchase.content.title}" has been completed successfully.`,
          data: {
            purchaseId: purchase.id,
            contentId: purchase.contentId,
            amount: purchase.amount,
          },
        });
      } catch (notificationError) {
        this.logger.error('Failed to create notification:', notificationError);
      }

      // Update content purchase count
      await this.prisma.content.update({
        where: { id: purchase.contentId },
        data: {
          purchaseCount: {
            increment: 1,
          },
        },
      });

      this.logger.log(`Content ${purchase.contentId} purchase count updated`);

    } catch (error) {
      this.logger.error(`Error processing Paystack charge success for ${reference}:`, error);
      throw error;
    }
  }
}