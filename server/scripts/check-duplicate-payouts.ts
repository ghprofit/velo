import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function checkDuplicatePayouts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    const jkCreator = await prisma.creatorProfile.findFirst({
      where: { displayName: 'JK', user: { email: 'ce-jkkuttor4923@st.umat.edu.gh' } },
    });

    if (!jkCreator) {
      console.log('Creator not found');
      return;
    }

    const payoutRequests = await prisma.payoutRequest.findMany({
      where: { creatorId: jkCreator.id },
      include: { payout: true },
      orderBy: { createdAt: 'asc' },
    });

    console.log('\n📊 Payout Requests and their linked Payouts:\n');

    for (const pr of payoutRequests) {
      console.log(`\nPayoutRequest: ${pr.id}`);
      console.log(`  Status: ${pr.status}`);
      console.log(`  Amount: $${pr.requestedAmount}`);
      console.log(`  Created: ${pr.createdAt.toISOString()}`);
      console.log(`  Linked Payout ID: ${pr.payoutId || 'None'}`);
      
      if (pr.payout) {
        console.log(`  Payout Status: ${pr.payout.status}`);
        console.log(`  Payout Amount: $${pr.payout.amount}`);
      }
    }

    console.log('\n\n📊 All Standalone Payouts:\n');

    const allPayouts = await prisma.payout.findMany({
      where: { creatorId: jkCreator.id },
      orderBy: { createdAt: 'asc' },
    });

    for (const payout of allPayouts) {
      console.log(`\nPayout: ${payout.id}`);
      console.log(`  Status: ${payout.status}`);
      console.log(`  Amount: $${payout.amount}`);
      console.log(`  Created: ${payout.createdAt.toISOString()}`);
      
      // Find which PayoutRequest links to this
      const linkedRequest = payoutRequests.find(pr => pr.payoutId === payout.id);
      if (linkedRequest) {
        console.log(`  Linked to PayoutRequest: ${linkedRequest.id} (${linkedRequest.status})`);
      } else {
        console.log(`  ⚠️ NOT LINKED to any PayoutRequest`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

checkDuplicatePayouts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
