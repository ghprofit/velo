import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EarningsTaskService {
  private readonly logger = new Logger(EarningsTaskService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs every hour to release pending earnings that have passed 24hr hold period
   * Moves earnings from pendingBalance to availableBalance for chargebacks protection
   */
  @Cron(CronExpression.EVERY_HOUR)
  async releasePendingEarnings() {
    this.logger.log('Starting scheduled task: Release pending earnings');

    try {
      // Find all purchases where:
      // 1. Earnings are still pending (earningsReleased = false)
      // 2. Pending period has expired (earningsPendingUntil <= now)
      // 3. Purchase is completed (not refunded)
      const purchasesToRelease = await this.prisma.purchase.findMany({
        where: {
          earningsReleased: false,
          earningsPendingUntil: {
            lte: new Date(),
          },
          status: 'COMPLETED',
        },
        include: {
          content: {
            select: {
              creatorId: true,
            },
          },
        },
      });

      this.logger.log(`Found ${purchasesToRelease.length} purchases ready to release earnings`);

      // Process each purchase in a transaction
      for (const purchase of purchasesToRelease) {
        try {
          await this.prisma.$transaction(async (tx) => {
            // Calculate earnings amount
            const earningsAmount = purchase.basePrice
              ? purchase.basePrice * 0.9
              : purchase.amount * 0.85;

            // Move from pending to available balance
            await tx.creatorProfile.update({
              where: { id: purchase.content.creatorId },
              data: {
                pendingBalance: { decrement: earningsAmount },
                availableBalance: { increment: earningsAmount },
              },
            });

            // Mark purchase earnings as released
            await tx.purchase.update({
              where: { id: purchase.id },
              data: {
                earningsReleased: true,
              },
            });

            this.logger.log(
              `Released earnings for purchase ${purchase.id}: $${earningsAmount.toFixed(2)} moved to available balance`,
            );
          });
        } catch (error) {
          this.logger.error(`Failed to release earnings for purchase ${purchase.id}:`, error);
          // Continue processing other purchases even if one fails
        }
      }

      this.logger.log('Completed scheduled task: Release pending earnings');
    } catch (error) {
      this.logger.error('Error in releasePendingEarnings task:', error);
    }
  }

  /**
   * Manual trigger for testing or admin use
   */
  async triggerManualRelease(): Promise<{ released: number; total: number }> {
    this.logger.log('Manual trigger: Release pending earnings');
    
    const before = await this.prisma.purchase.count({
      where: {
        earningsReleased: false,
        earningsPendingUntil: { lte: new Date() },
        status: 'COMPLETED',
      },
    });

    await this.releasePendingEarnings();

    const after = await this.prisma.purchase.count({
      where: {
        earningsReleased: false,
        earningsPendingUntil: { lte: new Date() },
        status: 'COMPLETED',
      },
    });

    return {
      released: before - after,
      total: before,
    };
  }
}
