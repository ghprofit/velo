/**
 * Migration Script: Initialize Pending/Available Balance System
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function migrateToPendingSystem() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log('🔄 Starting migration to pending/available balance system...\n');

  try {
    const creators = await prisma.creatorProfile.findMany({
      select: {
        id: true,
        displayName: true,
        totalEarnings: true,
        pendingBalance: true,
        availableBalance: true,
      },
    });

    console.log(`Found ${creators.length} creators to migrate\n`);

    let migrated = 0;
    let skipped = 0;

    for (const creator of creators) {
      if (creator.availableBalance > 0) {
        console.log(`⏭️  ${creator.displayName}: Already migrated`);
        skipped++;
        continue;
      }

      const completedPayouts = await prisma.payout.aggregate({
        where: { creatorId: creator.id, status: 'COMPLETED' },
        _sum: { amount: true },
      });

      const totalPayouts = completedPayouts._sum.amount || 0;
      const availableBalance = Math.max(0, creator.totalEarnings - totalPayouts);

      await prisma.creatorProfile.update({
        where: { id: creator.id },
        data: { availableBalance, pendingBalance: 0 },
      });

      console.log(`✅ ${creator.displayName}: Available: $${availableBalance.toFixed(2)}`);
      migrated++;
    }

    const purchaseUpdateResult = await prisma.purchase.updateMany({
      where: { earningsReleased: false, status: 'COMPLETED' },
      data: { earningsReleased: true, earningsPendingUntil: null },
    });

    console.log(`\n✅ Marked ${purchaseUpdateResult.count} purchases as released\n`);
    console.log(`📊 Migrated: ${migrated}, Skipped: ${skipped}`);
    console.log('\n✅ Migration completed!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

migrateToPendingSystem().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
