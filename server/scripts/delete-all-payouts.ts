import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function deleteAllPayouts() {
  console.log('🗑️  Starting deletion of all payout data...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    // Count existing records
    const payoutRequestCount = await prisma.payoutRequest.count();
    const payoutCount = await prisma.payout.count();

    console.log(`📊 Current data:`);
    console.log(`   - PayoutRequests: ${payoutRequestCount}`);
    console.log(`   - Payouts: ${payoutCount}\n`);

    if (payoutRequestCount === 0 && payoutCount === 0) {
      console.log('✅ No payout data to delete\n');
      return;
    }

    console.log('⚠️  Deleting all payout data...\n');

    // Delete in transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // First delete PayoutRequests (they reference Payouts)
      const deletedRequests = await tx.payoutRequest.deleteMany({});
      console.log(`   ✓ Deleted ${deletedRequests.count} PayoutRequests`);

      // Then delete Payouts
      const deletedPayouts = await tx.payout.deleteMany({});
      console.log(`   ✓ Deleted ${deletedPayouts.count} Payouts`);
    });

    console.log('\n✅ All payout data deleted successfully!\n');

  } catch (error) {
    console.error('❌ Deletion failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

deleteAllPayouts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
