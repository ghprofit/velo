import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { StrypayService } from './strypay.service';

@Controller('strypay')
export class StrypayController {
  private readonly logger = new Logger(StrypayController.name);

  constructor(
    private strypayService: StrypayService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private config: ConfigService,
  ) {}

  @Get('test')
  test() {
    return {
      ok: true,
      message: 'StrydPay webhook endpoint is reachable',
    };
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any): Promise<{ received: boolean }> {
    const txRef = this.extractTxRef(payload);
    if (!txRef) {
      this.logger.warn('StrydPay webhook received without tx_ref');
      return { received: true };
    }

    try {
      const status = await this.strypayService.checkPaymentStatus(txRef);
      if (!this.strypayService.isSuccessfulStatus(status.status)) {
        this.logger.log(`StrydPay webhook ignored for ${txRef}; status=${status.status}`);
        return { received: true };
      }

      await this.completePurchase(txRef, 'WEBHOOK');
    } catch (error) {
      this.logger.error(`Failed to process StrydPay webhook for ${txRef}:`, error);
    }

    return { received: true };
  }

  private extractTxRef(payload: any): string | null {
    return (
      payload?.tx_ref ||
      payload?.txRef ||
      payload?.reference ||
      payload?.data?.tx_ref ||
      payload?.data?.txRef ||
      payload?.data?.reference ||
      null
    );
  }

  private async completePurchase(txRef: string, completedBy: 'WEBHOOK') {
    const idempotencyKey = `webhook_${txRef}`;
    let purchaseData: any = null;

    try {
      await this.prisma.$transaction(
        async (tx) => {
          const purchase = await tx.purchase.findFirst({
            where: {
              OR: [{ paymentIntentId: txRef }, { transactionId: txRef }],
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

          if (!purchase) {
            this.logger.warn(`Purchase not found for StrydPay tx_ref: ${txRef}`);
            return;
          }

          if (purchase.status === 'COMPLETED') {
            this.logger.log(`Purchase ${purchase.id} already completed`);
            return;
          }

          const creatorEarnings = purchase.basePrice
            ? purchase.basePrice * 0.9
            : purchase.amount * 0.85;
          const earningsPendingUntil = new Date();
          earningsPendingUntil.setHours(earningsPendingUntil.getHours() + 24);

          await tx.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'COMPLETED',
              transactionId: txRef,
              completionIdempotencyKey: idempotencyKey,
              completedBy,
              completedAt: new Date(),
              webhookProcessedAt: new Date(),
              earningsPendingUntil,
              earningsReleased: false,
            },
          });

          await tx.content.update({
            where: { id: purchase.contentId },
            data: {
              purchaseCount: { increment: 1 },
              totalRevenue: { increment: purchase.amount },
            },
          });

          await tx.creatorProfile.update({
            where: { id: purchase.content.creatorId },
            data: {
              totalEarnings: { increment: creatorEarnings },
              pendingBalance: { increment: creatorEarnings },
              totalPurchases: { increment: 1 },
            },
          });

          purchaseData = {
            id: purchase.id,
            buyerEmail: purchase.buyerSession?.email,
            contentTitle: purchase.content.title,
            contentId: purchase.content.id,
            amount: purchase.amount,
            basePrice: purchase.basePrice || purchase.content.price,
            accessToken: purchase.accessToken,
            creatorEmail: purchase.content.creator.user.email,
            creatorUserId: purchase.content.creator.user.id,
            creatorName: purchase.content.creator.displayName,
            creatorEarnings,
          };
        },
        { maxWait: 5000, timeout: 10000 },
      );
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('completionIdempotencyKey')) {
        this.logger.log(`StrydPay webhook race detected for ${txRef}; purchase already completed`);
        return;
      }

      throw error;
    }

    if (!purchaseData) {
      return;
    }

    const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';

    if (purchaseData.buyerEmail) {
      try {
        await this.emailService.sendPurchaseReceipt(purchaseData.buyerEmail, {
          buyer_email: purchaseData.buyerEmail,
          content_title: purchaseData.contentTitle,
          amount: purchaseData.amount.toFixed(2),
          date: new Date().toLocaleDateString(),
          access_link: `${clientUrl}/c/${purchaseData.contentId}?token=${purchaseData.accessToken}`,
          transaction_id: txRef,
        });
      } catch (error) {
        this.logger.error('Failed to send StrydPay purchase receipt:', error);
      }
    }

    try {
      await this.emailService.sendCreatorSaleNotification(purchaseData.creatorEmail, {
        creator_name: purchaseData.creatorName,
        content_title: purchaseData.contentTitle,
        sale_amount: purchaseData.basePrice.toFixed(2),
        creator_earnings: purchaseData.creatorEarnings.toFixed(2),
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      this.logger.error('Failed to send StrydPay creator sale notification:', error);
    }

    try {
      await this.notificationsService.notify(
        purchaseData.creatorUserId,
        NotificationType.PURCHASE_MADE,
        'Your Content Was Purchased!',
        `Your content "${purchaseData.contentTitle}" was purchased! You earned $${purchaseData.creatorEarnings.toFixed(2)}`,
        {
          purchaseId: purchaseData.id,
          contentId: purchaseData.contentId,
          earnings: purchaseData.creatorEarnings,
        },
      );
      await this.notificationsService.notifyAdmins(
        NotificationType.PURCHASE_MADE,
        'New Purchase on Platform',
        `A new purchase was made: "${purchaseData.contentTitle}" by ${purchaseData.creatorName} for $${purchaseData.amount.toFixed(2)}`,
        {
          purchaseId: purchaseData.id,
          contentId: purchaseData.contentId,
          creatorName: purchaseData.creatorName,
          amount: purchaseData.amount,
        },
      );
    } catch (error) {
      this.logger.error('Failed to create StrydPay purchase notifications:', error);
    }
  }
}
