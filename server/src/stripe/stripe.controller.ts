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
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { ConfigService } from '@nestjs/config';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private config: ConfigService,
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
   * Handle Stripe webhooks (Bug #2 - improved error handling)
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const rawBody = request.rawBody;

    if (!rawBody) {
      this.logger.error('No raw body found in webhook request');
      throw new BadRequestException('Invalid request body');
    }

    if (!signature) {
      this.logger.error('No stripe-signature header found');
      throw new BadRequestException('Missing signature header');
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Webhook signature verification failed:', errorMessage);

      // Check if it's a missing secret error
      if (errorMessage?.includes('not configured')) {
        this.logger.error('CRITICAL: STRIPE_WEBHOOK_SECRET is not configured!');
      }

      // Return 400 to tell Stripe the webhook failed
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Webhook received: ${event.type}`);

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
   * Handle successful payment (webhook-based confirmation)
   * Uses idempotency keys and transactions to prevent race conditions (Bug #1, #10)
   */
  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);

    const idempotencyKey = `webhook_${paymentIntent.id}_${Date.now()}`;

    // Variable to store purchase data for email notifications
    let purchaseData: any = null;

    try {
      await this.prisma.$transaction(
        async (tx) => {
          let purchase = await tx.purchase.findUnique({
            where: { paymentIntentId: paymentIntent.id },
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
            this.logger.warn(
              `Purchase not found for payment intent: ${paymentIntent.id}`,
            );

            // FALLBACK: Try to create purchase from webhook metadata
            const { contentId, sessionId } = paymentIntent.metadata || {};

            if (!contentId || !sessionId) {
              this.logger.error(
                `Cannot create purchase from webhook - missing metadata. ContentId: ${contentId}, SessionId: ${sessionId}`,
              );
              return;
            }

            this.logger.log(
              `Attempting to create purchase from webhook for payment intent: ${paymentIntent.id}`,
            );

            try {
              // Get content and session details
              const [content, buyerSession] = await Promise.all([
                tx.content.findUnique({
                  where: { id: contentId },
                  include: {
                    creator: {
                      include: { user: true },
                    },
                  },
                }),
                tx.buyerSession.findUnique({ where: { id: sessionId } }),
              ]);

              if (!content || !buyerSession) {
                this.logger.error(
                  `Cannot create purchase - content or session not found. Content: ${!!content}, Session: ${!!buyerSession}`,
                );
                return;
              }

              //CRITICAL: Check if buyer email is present
              if (!buyerSession.email) {
                this.logger.warn(
                  `INVOICE EMAIL ISSUE: No email found for buyerSession ${sessionId}. Invoice will NOT be sent! Payment Intent: ${paymentIntent.id}`,
                );
              }

              // Generate access token
              const crypto = require('crypto');
              const accessToken = crypto.randomBytes(32).toString('hex');

              // Calculate amounts
              const amount = paymentIntent.amount / 100; // Convert from cents
              const basePrice = content.price; // Use content price as base

              // Create purchase record from webhook
              purchase = await tx.purchase.create({
                data: {
                  contentId,
                  buyerSessionId: sessionId,
                  amount,
                  basePrice,
                  currency: paymentIntent.currency.toUpperCase(),
                  paymentProvider: 'STRIPE',
                  paymentIntentId: paymentIntent.id,
                  status: 'COMPLETED',
                  transactionId: paymentIntent.id,
                  completedBy: 'WEBHOOK',
                  completedAt: new Date(),
                  webhookProcessedAt: new Date(),
                  completionIdempotencyKey: idempotencyKey,
                  accessToken,
                  purchaseFingerprint: buyerSession.fingerprint,
                  trustedFingerprints: buyerSession.fingerprint
                    ? [buyerSession.fingerprint]
                    : [],
                  purchaseIpAddress: buyerSession.ipAddress,
                },
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

              this.logger.log(
                `✅ Purchase created from webhook: ${purchase.id} for payment intent: ${paymentIntent.id}`,
              );

              // Update content stats
              await tx.content.update({
                where: { id: contentId },
                data: {
                  purchaseCount: { increment: 1 },
                  totalRevenue: { increment: amount },
                },
              });

              // Update creator earnings - 90% of base price
              const creatorEarnings = basePrice * 0.9;

              // Calculate when earnings will be available (24 hours from now)
              const earningsPendingUntil = new Date();
              earningsPendingUntil.setHours(earningsPendingUntil.getHours() + 24);

              // Add earnings to PENDING balance (will move to available after 24hr)
              await tx.creatorProfile.update({
                where: { id: content.creatorId },
                data: {
                  totalEarnings: { increment: creatorEarnings },
                  pendingBalance: { increment: creatorEarnings }, // Add to pending
                  totalPurchases: { increment: 1 },
                },
              });

              // Store purchase data for email notifications
              purchaseData = {
                id: purchase.id,
                buyerEmail: buyerSession.email,
                contentTitle: content.title,
                contentId: content.id,
                amount,
                basePrice,
                accessToken,
                creatorEmail: content.creator.user.email,
                creatorName: content.creator.displayName,
                creatorEarnings,
              };

              this.logger.log(
                `Purchase ${purchase.id} created and confirmed by WEBHOOK FALLBACK with idempotency key ${idempotencyKey}`,
              );

              // Early return since we've already processed everything
              return;
            } catch (createError) {
              this.logger.error(
                `Failed to create purchase from webhook:`,
                createError,
              );
              return;
            }
          }

          // Idempotency check - prevent duplicate processing
          if (purchase.status === 'COMPLETED') {
            this.logger.log(
              `Purchase ${purchase.id} already completed by ${purchase.completedBy}`,
            );
            return;
          }

          // Update purchase status
          await tx.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'COMPLETED',
              transactionId: paymentIntent.id,
              completionIdempotencyKey: idempotencyKey,
              completedBy: 'WEBHOOK',
              completedAt: new Date(),
              webhookProcessedAt: new Date(),
            },
          });

          // Update content stats
          await tx.content.update({
            where: { id: purchase.contentId },
            data: {
              purchaseCount: { increment: 1 },
              totalRevenue: { increment: purchase.amount },
            },
          });

          // Update creator earnings - 90% of base price
          // For new purchases: basePrice exists, creator gets 90% of basePrice
          // For old purchases (migration): basePrice is null, use old calculation (85% of amount)
          const creatorEarnings = purchase.basePrice
            ? purchase.basePrice * 0.9
            : purchase.amount * 0.85;

          // Calculate when earnings will be available (24 hours from now)
          const earningsPendingUntil = new Date();
          earningsPendingUntil.setHours(earningsPendingUntil.getHours() + 24);

          // Update purchase with pending period
          await tx.purchase.update({
            where: { id: purchase.id },
            data: {
              earningsPendingUntil,
              earningsReleased: false,
            },
          });

          // Add earnings to PENDING balance (will move to available after 24hr)
          await tx.creatorProfile.update({
            where: { id: purchase.content.creatorId },
            data: {
              totalEarnings: { increment: creatorEarnings },
              pendingBalance: { increment: creatorEarnings }, // Add to pending
              totalPurchases: { increment: 1 },
            },
          });

          // Store purchase data for email notifications
          purchaseData = {
            id: purchase.id,
            buyerEmail: purchase.buyerSession?.email,
            contentTitle: purchase.content.title,
            contentId: purchase.content.id,
            amount: purchase.amount,
            basePrice: purchase.basePrice || purchase.content.price,
            accessToken: purchase.accessToken,
            creatorEmail: purchase.content.creator.user.email,
            creatorName: purchase.content.creator.displayName,
            creatorEarnings,
          };

          this.logger.log(
            `Purchase ${purchase.id} confirmed by WEBHOOK with idempotency key ${idempotencyKey}`,
          );
        },
        { maxWait: 5000, timeout: 10000 },
      );

      // Send email notifications (after transaction succeeds)
      if (purchaseData) {
        // Send purchase receipt to buyer
        if (purchaseData.buyerEmail) {
          try {
            const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';
            this.logger.log(
              `[EMAIL] Sending purchase receipt to ${purchaseData.buyerEmail} for purchase ${purchaseData.id}`,
            );
            const emailResult = await this.emailService.sendPurchaseReceipt(
              purchaseData.buyerEmail,
              {
                buyer_email: purchaseData.buyerEmail,
                content_title: purchaseData.contentTitle,
                amount: purchaseData.amount.toFixed(2),
                date: new Date().toLocaleDateString(),
                access_link: `${clientUrl}/c/${purchaseData.contentId}?token=${purchaseData.accessToken}`,
                transaction_id: paymentIntent.id,
              },
            );

            if (emailResult.success) {
              this.logger.log(
                `[EMAIL] ✅ Purchase receipt sent successfully to ${purchaseData.buyerEmail}. MessageId: ${emailResult.messageId}`,
              );
            } else {
              this.logger.error(
                `[EMAIL] ❌ Failed to send purchase receipt to ${purchaseData.buyerEmail}: ${emailResult.error}`,
              );
            }
          } catch (error) {
            this.logger.error(
              `[EMAIL] Exception while sending purchase receipt to ${purchaseData.buyerEmail}:`,
              error,
            );
          }
        } else {
          this.logger.warn(
            `[EMAIL] ⚠️ No buyer email found for purchase ${purchaseData.id}. Invoice NOT sent!`,
          );
        }

        // Send sale notification to creator
        try {
          this.logger.log(
            `[EMAIL] Sending creator sale notification to ${purchaseData.creatorEmail} for purchase ${purchaseData.id}`,
          );
          const creatorEmailResult = await this.emailService.sendCreatorSaleNotification(
            purchaseData.creatorEmail,
            {
              creator_name: purchaseData.creatorName,
              content_title: purchaseData.contentTitle,
              sale_amount: purchaseData.basePrice.toFixed(2),
              creator_earnings: purchaseData.creatorEarnings.toFixed(2),
              date: new Date().toLocaleDateString(),
            },
          );

          if (creatorEmailResult.success) {
            this.logger.log(
              `[EMAIL] ✅ Creator sale notification sent to ${purchaseData.creatorEmail}. MessageId: ${creatorEmailResult.messageId}`,
            );
          } else {
            this.logger.error(
              `[EMAIL] ❌ Failed to send creator sale notification to ${purchaseData.creatorEmail}: ${creatorEmailResult.error}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `[EMAIL] Exception while sending creator sale notification to ${purchaseData.creatorEmail}:`,
            error,
          );
        }

        // ========== CREATE IN-APP NOTIFICATIONS ==========

        // Get buyer user (if registered) to send buyer notification
        let buyerUser = null;
        try {
          buyerUser = await this.prisma.user.findUnique({
            where: { email: purchaseData.buyerEmail },
          });
        } catch (error) {
          this.logger.warn(
            `[NOTIFICATION] Could not find buyer user by email: ${purchaseData.buyerEmail}`,
          );
        }

        // 1. Send notification to BUYER (if they are registered as a user)
        if (buyerUser) {
          try {
            this.logger.log(
              `[NOTIFICATION] Creating purchase notification for buyer: ${buyerUser.id}`,
            );
            await this.notificationsService.createNotification({
              userId: buyerUser.id,
              type: NotificationType.PURCHASE_MADE,
              title: 'Purchase Successful',
              message: `You successfully purchased "${purchaseData.contentTitle}" for $${purchaseData.amount.toFixed(2)}`,
              metadata: {
                purchaseId: purchaseData.id,
                contentId: purchaseData.contentId,
                amount: purchaseData.amount,
              },
            });
            this.logger.log(
              `[NOTIFICATION] ✅ Buyer notification created for user: ${buyerUser.id}`,
            );
          } catch (error) {
            this.logger.error(
              `[NOTIFICATION] ❌ Failed to create buyer notification:`,
              error,
            );
          }
        } else {
          this.logger.log(
            `[NOTIFICATION] ℹ️ Buyer is not a registered user (anonymous purchase with email: ${purchaseData.buyerEmail})`,
          );
        }

        // 2. Get creator profile to find associated user and send creator notification
        try {
          const creatorProfile = await this.prisma.creatorProfile.findFirst({
            where: { displayName: purchaseData.creatorName },
            include: { user: true },
          });

          if (creatorProfile?.user) {
            this.logger.log(
              `[NOTIFICATION] Creating sale notification for creator: ${creatorProfile.user.id}`,
            );
            await this.notificationsService.createNotification({
              userId: creatorProfile.user.id,
              type: NotificationType.PURCHASE_MADE,
              title: 'Your Content Was Purchased',
              message: `Your content "${purchaseData.contentTitle}" was purchased! You earned $${purchaseData.creatorEarnings.toFixed(2)}`,
              metadata: {
                purchaseId: purchaseData.id,
                contentId: purchaseData.contentId,
                earnings: purchaseData.creatorEarnings,
              },
            });
            this.logger.log(
              `[NOTIFICATION] ✅ Creator notification created for user: ${creatorProfile.user.id}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `[NOTIFICATION] ❌ Failed to create creator notification:`,
            error,
          );
        }

        // 3. Get all ADMIN users and send them notifications
        try {
          const adminUsers = await this.prisma.user.findMany({
            where: {
              role: 'ADMIN',
            },
            select: { id: true },
          });

          if (adminUsers.length > 0) {
            this.logger.log(
              `[NOTIFICATION] Creating purchase alert for ${adminUsers.length} admin user(s)`,
            );

            for (const adminUser of adminUsers) {
              try {
                await this.notificationsService.createNotification({
                  userId: adminUser.id,
                  type: NotificationType.PURCHASE_MADE,
                  title: 'New Purchase on Platform',
                  message: `A new purchase was made: "${purchaseData.contentTitle}" by ${purchaseData.creatorName} for $${purchaseData.amount.toFixed(2)}`,
                  metadata: {
                    purchaseId: purchaseData.id,
                    contentId: purchaseData.contentId,
                    creatorName: purchaseData.creatorName,
                    amount: purchaseData.amount,
                  },
                });
                this.logger.log(
                  `[NOTIFICATION] ✅ Admin notification created for admin: ${adminUser.id}`,
                );
              } catch (adminNotifError) {
                this.logger.error(
                  `[NOTIFICATION] ❌ Failed to create notification for admin ${adminUser.id}:`,
                  adminNotifError,
                );
              }
            }
          } else {
            this.logger.warn(
              `[NOTIFICATION] ⚠️ No admin users found to notify about purchase`,
            );
          }
        } catch (error) {
          this.logger.error(
            `[NOTIFICATION] ❌ Failed to create admin notifications:`,
            error,
          );
        }
      } else {
        this.logger.warn(`[EMAIL] No purchase data available for email notifications`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process payment_intent.succeeded webhook:`,
        error,
      );
      throw error;
    }
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
   * Handle refund with validation and transaction support (Bug #7)
   */
  private async handleChargeRefunded(charge: any) {
    this.logger.log(`Processing refund for charge: ${charge.id}`);

    const refundAmount = (charge.amount_refunded || 0) / 100;

    if (refundAmount <= 0) {
      this.logger.warn(`Invalid refund amount: ${refundAmount}`);
      return;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.findUnique({
          where: { paymentIntentId: charge.payment_intent },
          include: {
            content: {
              include: { creator: true },
            },
          },
        });

        if (!purchase) {
          this.logger.warn(
            `Purchase not found for charge: ${charge.payment_intent}`,
          );
          return;
        }

        // Calculate total refunded amount
        const previouslyRefunded = purchase.refundedAmount || 0;
        const totalRefunded = previouslyRefunded + refundAmount;

        // Validate refund amount doesn't exceed purchase amount (Bug #7)
        if (totalRefunded > purchase.amount * 1.01) {
          this.logger.error(
            `Refund amount ${totalRefunded} exceeds purchase amount ${purchase.amount}`,
          );
          return;
        }

        // Determine if this is a full or partial refund (99% threshold)
        const isFullRefund = totalRefunded >= purchase.amount * 0.99;

        // Update purchase record
        await tx.purchase.update({
          where: { id: purchase.id },
          data: {
            status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
            refundedAmount: totalRefunded,
            isFullyRefunded: isFullRefund,
            isPartiallyRefunded: !isFullRefund && totalRefunded > 0,
            refundedAt: purchase.refundedAt || new Date(),
          },
        });

        // Only reverse stats for FULL refunds
        if (isFullRefund && purchase.status === 'COMPLETED') {
          // Reverse content stats
          await tx.content.update({
            where: { id: purchase.contentId },
            data: {
              purchaseCount: { decrement: 1 },
              totalRevenue: { decrement: purchase.amount },
            },
          });

          // Calculate creator earnings that need to be reversed
          const creatorEarnings = purchase.basePrice
            ? purchase.basePrice * 0.9
            : purchase.amount * 0.85;

          // Get current creator balance state
          const creator = await tx.creatorProfile.findUnique({
            where: { id: purchase.content.creatorId },
            select: {
              pendingBalance: true,
              availableBalance: true,
            },
          });

          // Determine if earnings are still pending or already available
          const earningsReleased = purchase.earningsReleased || false;
          
          if (earningsReleased) {
            // Earnings were released to available balance - deduct from there
            await tx.creatorProfile.update({
              where: { id: purchase.content.creatorId },
              data: {
                totalEarnings: { decrement: creatorEarnings },
                availableBalance: { decrement: creatorEarnings },
                totalPurchases: { decrement: 1 },
              },
            });
            this.logger.log(`Refund deducted from available balance for purchase ${purchase.id}`);
          } else {
            // Earnings still in pending - deduct from pending balance
            await tx.creatorProfile.update({
              where: { id: purchase.content.creatorId },
              data: {
                totalEarnings: { decrement: creatorEarnings },
                pendingBalance: { decrement: creatorEarnings },
                totalPurchases: { decrement: 1 },
              },
            });
            this.logger.log(`Refund deducted from pending balance for purchase ${purchase.id}`);
          }

          // Mark purchase earnings as no longer needing release
          await tx.purchase.update({
            where: { id: purchase.id },
            data: {
              earningsReleased: false,
              earningsPendingUntil: null,
            },
          });

          this.logger.log(`Full refund processed for purchase ${purchase.id}`);
        } else {
          this.logger.log(
            `Partial refund (${refundAmount}) processed for purchase ${purchase.id}`,
          );
        }
      });
    } catch (error) {
      this.logger.error('Failed to process refund:', error);
      throw error;
    }
  }
}
