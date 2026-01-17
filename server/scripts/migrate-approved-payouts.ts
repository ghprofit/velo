import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function migrateApprovedPayouts() {
  console.log('🔄 Starting migration of APPROVED payout requests...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    // Find all APPROVED payout requests
    const approvedRequests = await prisma.payoutRequest.findMany({
      where: { status: 'APPROVED' },
      include: {
        payout: true,
        creator: { include: { user: true } },
      },
    });

    console.log(`📋 Found ${approvedRequests.length} APPROVED payout requests\n`);

    if (approvedRequests.length === 0) {
      console.log('✅ No migration needed - no APPROVED requests found\n');
      return;
    }

    let updatedRequests = 0;
    let updatedPayouts = 0;

    for (const request of approvedRequests) {
      console.log(`   Processing: ${request.creator.displayName} - $${request.requestedAmount}`);

      // Update PayoutRequest to PROCESSING
      await prisma.payoutRequest.update({
        where: { id: request.id },
        data: { status: 'PROCESSING' },
      });
      updatedRequests++;

      // Update linked Payout if it's PENDING
      if (request.payout && request.payout.status === 'PENDING') {
        await prisma.payout.update({
          where: { id: request.payout.id },
          data: { status: 'PROCESSING' },
        });
        updatedPayouts++;
      }
    }

    console.log('\n📊 Migration Results:');
    console.log(`   ✓ PayoutRequests updated: ${updatedRequests}`);
    console.log(`   ✓ Payouts updated: ${updatedPayouts}`);
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

migrateApprovedPayouts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
