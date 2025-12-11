import {
  Controller,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  Logger,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
  ) {}

  /**
   * Get Stripe publishable key
   */
  @Get('config')
  getConfig() {
    return {
      publishableKey: this.stripeService.getPublishableKey(),
    };
  }

  /**
   * Handle Stripe webhooks
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing request body');
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid signature');
    }

    this.logger.log(`Received webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.type}:`, error);
      // Return 200 to Stripe even on error to prevent retries
      // Log the error for manual investigation
    }

    return { received: true };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);

    // Find the purchase by payment intent ID
    const purchase = await this.prisma.purchase.findUnique({
      where: { paymentIntentId: paymentIntent.id },
      include: {
        content: {
          include: {
            creator: true,
          },
        },
      },
    });

    if (!purchase) {
      this.logger.warn(`Purchase not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Check if already completed (to avoid double-processing)
    if (purchase.status === 'COMPLETED') {
      this.logger.log(`Purchase ${purchase.id} already completed, skipping webhook processing`);
      return;
    }

    // Update purchase status to COMPLETED
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'COMPLETED',
        transactionId: paymentIntent.id,
      },
    });

    // Update content stats
    await this.prisma.content.update({
      where: { id: purchase.contentId },
      data: {
        purchaseCount: { increment: 1 },
        totalRevenue: { increment: purchase.amount },
      },
    });

    // Update creator earnings
    const creatorEarnings = purchase.amount * 0.85; // 85% to creator, 15% platform fee
    await this.prisma.creatorProfile.update({
      where: { id: purchase.content.creatorId },
      data: {
        totalEarnings: { increment: creatorEarnings },
        totalPurchases: { increment: 1 },
      },
    });

    this.logger.log(`Purchase ${purchase.id} completed successfully`);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentIntentFailed(paymentIntent: any) {
    this.logger.log(`Payment failed: ${paymentIntent.id}`);

    // Find the purchase by payment intent ID
    const purchase = await this.prisma.purchase.findUnique({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!purchase) {
      this.logger.warn(`Purchase not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update purchase status to FAILED
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'FAILED',
      },
    });

    this.logger.log(`Purchase ${purchase.id} marked as failed`);
  }

  /**
   * Handle refund
   */
  private async handleChargeRefunded(charge: any) {
    this.logger.log(`Charge refunded: ${charge.id}`);

    // Find the purchase by payment intent ID
    const purchase = await this.prisma.purchase.findUnique({
      where: { paymentIntentId: charge.payment_intent },
      include: {
        content: {
          include: {
            creator: true,
          },
        },
      },
    });

    if (!purchase) {
      this.logger.warn(`Purchase not found for charge: ${charge.id}`);
      return;
    }

    // Update purchase status to REFUNDED
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'REFUNDED',
      },
    });

    // Reverse content stats
    await this.prisma.content.update({
      where: { id: purchase.contentId },
      data: {
        purchaseCount: { decrement: 1 },
        totalRevenue: { decrement: purchase.amount },
      },
    });

    // Reverse creator earnings
    const creatorEarnings = purchase.amount * 0.85;
    await this.prisma.creatorProfile.update({
      where: { id: purchase.content.creatorId },
      data: {
        totalEarnings: { decrement: creatorEarnings },
        totalPurchases: { decrement: 1 },
      },
    });

    this.logger.log(`Purchase ${purchase.id} refunded successfully`);
  }
}
