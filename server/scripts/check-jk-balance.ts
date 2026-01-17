import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EarningsService } from '../src/earnings/earnings.service';

async function checkJKBalance() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const earningsService = app.get(EarningsService);

  try {
    // Find all JK creators
    const jkCreators = await prisma.creatorProfile.findMany({
      where: { displayName: 'JK' },
      include: { user: true },
    });

    if (jkCreators.length === 0) {
      console.log('Creator "JK" not found');
      return;
    }

    console.log(`\n📊 Found ${jkCreators.length} creator(s) with displayName "JK"\n`);

    for (let i = 0; i < jkCreators.length; i++) {
      const jkCreator = jkCreators[i]!;
      
      console.log(`\n=== Creator #${i + 1} (ID: ${jkCreator.id}, Email: ${jkCreator.user.email}) ===\n`);
      
      // Get balance using the service
      const balance = await earningsService.getBalance(jkCreator.userId);
      
      console.log('   From EarningsService:');
      console.log(`   - Available Balance: $${balance.availableBalance}`);
      console.log(`   - Pending Balance: $${balance.pendingBalance}`);
      console.log(`   - Lifetime Earnings: $${balance.lifetimeEarnings}`);
      console.log(`   - Total Payouts: $${balance.totalPayouts}\n`);

      // Check raw database values
      console.log('   From Database (CreatorProfile):');
      console.log(`   - Total Earnings: $${jkCreator.totalEarnings}`);
      console.log(`   - Total Purchases: ${jkCreator.totalPurchases}\n`);

      // Check payout requests
      const payoutRequests = await prisma.payoutRequest.findMany({
        where: { creatorId: jkCreator.id },
        select: { status: true, requestedAmount: true },
      });

      console.log('   Payout Requests:');
      if (payoutRequests.length === 0) {
        console.log('   - None\n');
      } else {
        payoutRequests.forEach(pr => {
          console.log(`   - ${pr.status}: $${pr.requestedAmount}`);
        });
        console.log('');
      }

      // Check completed payouts
      const payouts = await prisma.payout.findMany({
        where: { creatorId: jkCreator.id },
        select: { status: true, amount: true },
      });

      console.log('   Payouts:');
      if (payouts.length === 0) {
        console.log('   - None\n');
      } else {
        payouts.forEach(p => {
          console.log(`   - ${p.status}: $${p.amount}`);
        });
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

checkJKBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
