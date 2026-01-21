import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function updatePayoutStatus() {
  console.log('Starting payout status update...');

  // Update creators without payout methods to PENDING
  const result = await prisma.creatorProfile.updateMany({
    where: {
      AND: [
        { payoutSetupCompleted: false },
        { stripeAccountId: null },
        { paypalEmail: null },
        { payoutStatus: 'ACTIVE' },
      ],
    },
    data: {
      payoutStatus: 'PENDING',
    },
  });

  console.log(`Updated ${result.count} creator profiles to PENDING status`);

  // Get summary of payout statuses
  const statuses = await prisma.creatorProfile.groupBy({
    by: ['payoutStatus'],
    _count: true,
  });

  console.log('\nCurrent payout status distribution:');
  statuses.forEach((status) => {
    console.log(`  ${status.payoutStatus}: ${status._count}`);
  });
}

updatePayoutStatus()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
