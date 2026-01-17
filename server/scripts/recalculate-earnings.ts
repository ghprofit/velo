import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function recalculateCreatorEarnings() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    console.log('\n🔄 Recalculating creator earnings from completed purchases...\n');

    // Get all creators
    const creators = await prisma.creatorProfile.findMany({
      select: { id: true, displayName: true, totalEarnings: true, totalPurchases: true },
    });

    for (const creator of creators) {
      // Get all completed purchases for this creator
      const purchases = await prisma.purchase.findMany({
        where: {
          content: { creatorId: creator.id },
          status: 'COMPLETED',
        },
        select: { amount: true, basePrice: true },
      });

      // Calculate correct total earnings
      const correctEarnings = purchases.reduce((sum, p) => {
        const earnings = p.basePrice ? p.basePrice * 0.9 : p.amount * 0.85;
        return sum + earnings;
      }, 0);

      const correctPurchaseCount = purchases.length;

      // Update creator profile
      await prisma.creatorProfile.update({
        where: { id: creator.id },
        data: {
          totalEarnings: correctEarnings,
          totalPurchases: correctPurchaseCount,
        },
      });

      console.log(`✓ ${creator.displayName}:`);
      console.log(`   Old: $${creator.totalEarnings} (${creator.totalPurchases} purchases)`);
      console.log(`   New: $${correctEarnings.toFixed(2)} (${correctPurchaseCount} purchases)\n`);
    }

    console.log('✅ Creator earnings recalculated successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

recalculateCreatorEarnings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
