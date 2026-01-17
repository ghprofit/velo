import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function cleanupInvalidPayouts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    console.log('\n🧹 Cleaning up invalid PROCESSING payouts...\n');

    // Delete all PROCESSING payouts and set their PayoutRequests to CANCELLED
    const processingPayouts = await prisma.payout.findMany({
      where: { status: 'PROCESSING' },
      include: { payoutRequest: true },
    });

    console.log(`Found ${processingPayouts.length} PROCESSING payouts to clean up\n`);

    for (const payout of processingPayouts) {
      console.log(`Deleting Payout ${payout.id} ($${payout.amount})`);
      
      // Delete the payout
      await prisma.payout.delete({
        where: { id: payout.id },
      });

      // Cancel the linked PayoutRequest if it exists
      if (payout.payoutRequest) {
        console.log(`  Cancelling PayoutRequest ${payout.payoutRequest.id}`);
        await prisma.payoutRequest.update({
          where: { id: payout.payoutRequest.id },
          data: {
            status: 'CANCELLED',
            payoutId: null,
          },
        });
      }
    }

    console.log('\n✅ Cleanup complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

cleanupInvalidPayouts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
