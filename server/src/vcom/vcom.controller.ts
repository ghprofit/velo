import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { VcomService } from './vcom.service';

@Controller('vcom')
export class VcomController {
  private readonly logger = new Logger(VcomController.name);

  constructor(
    private vcomService: VcomService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private config: ConfigService,
  ) {}

  @Get('test')
  test() {
    return { ok: true, message: 'vcom webhook endpoint is reachable' };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-vcom-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const rawBody = request.rawBody;

    if (!rawBody) {
      throw new BadRequestException('Invalid request body');
    }

    if (!this.vcomService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('vcom webhook: invalid signature');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody.toString());
    } catch {
      throw new BadRequestException('Invalid webhook payload');
    }

    const reference = payload?.reference;
    if (!reference) {
      this.logger.warn('vcom webhook received without reference');
      return { received: true };
    }

    if (payload.status !== 'paid') {
      this.logger.log(`vcom webhook ignored for ${reference}; status=${payload.status}`);
      return { received: true };
    }

    try {
      await this.completePurchase(reference, 'WEBHOOK');
    } catch (error) {
      this.logger.error(`Failed to process vcom webhook for ${reference}:`, error);
    }

    return { received: true };
  }

  private async completePurchase(reference: string, completedBy: 'WEBHOOK') {
    const idempotencyKey = `webhook_vcom_${reference}`;
    let purchaseData: any = null;

    try {
      await this.prisma.$transaction(
        async (tx) => {
          const purchase = await tx.purchase.findFirst({
            where: {
              OR: [{ paymentIntentId: reference }, { transactionId: reference }],
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
            this.logger.warn(`Purchase not found for vcom reference: ${reference}`);
            return;
          }

          if (purchase.status === 'COMPLETED') {
            this.logger.log(`Purchase ${purchase.id} already completed`);
            return;
          }

          const creatorEarnings = purchase.basePrice
            ? purchase.basePrice * 0.8
            : purchase.amount * 0.85;
          const earningsPendingUntil = new Date();
          earningsPendingUntil.setHours(earningsPendingUntil.getHours() + 24);

          await tx.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'COMPLETED',
              transactionId: reference,
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
        this.logger.log(`vcom webhook race detected for ${reference}; purchase already completed`);
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
          transaction_id: reference,
        });
      } catch (error) {
        this.logger.error('Failed to send vcom purchase receipt:', error);
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
      this.logger.error('Failed to send vcom creator sale notification:', error);
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
      this.logger.error('Failed to create vcom purchase notifications:', error);
    }
  }
}
