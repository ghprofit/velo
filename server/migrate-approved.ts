import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateApprovedPayouts() {
  console.log('Starting migration of APPROVED payout requests...\n');

  try {
    // Find all APPROVED payout requests
    const approvedRequests = await prisma.payoutRequest.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        payout: true,
        creator: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${approvedRequests.length} APPROVED payout requests to migrate\n`);

    if (approvedRequests.length === 0) {
      console.log('✅ No approved payout requests found. Migration not needed.');
      return;
    }

    let updatedRequests = 0;
    let updatedPayouts = 0;

    // Update each approved request
    for (const request of approvedRequests) {
      console.log(`Processing request ${request.id} for creator ${request.creator.displayName}...`);

      // Update PayoutRequest status to PROCESSING
      await prisma.payoutRequest.update({
        where: { id: request.id },
        data: { status: 'PROCESSING' },
      });
      updatedRequests++;
      console.log(`  ✓ Updated PayoutRequest to PROCESSING`);

      // If there's a linked Payout with PENDING status, update it to PROCESSING
      if (request.payout && request.payout.status === 'PENDING') {
        await prisma.payout.update({
          where: { id: request.payout.id },
          data: { status: 'PROCESSING' },
        });
        updatedPayouts++;
        console.log(`  ✓ Updated linked Payout to PROCESSING`);
      }

      console.log('');
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   - PayoutRequests updated: ${updatedRequests}`);
    console.log(`   - Payouts updated: ${updatedPayouts}`);
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateApprovedPayouts()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
