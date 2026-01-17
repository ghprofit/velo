import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function checkCreatorEarnings() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    const creator = await prisma.creatorProfile.findFirst({
      select: {
        id: true,
        displayName: true,
        totalEarnings: true,
        totalPurchases: true,
        user: { select: { email: true } },
      },
    });

    console.log('\n📊 Creator Earnings Check:');
    console.log(`   Creator: ${creator?.displayName}`);
    console.log(`   Email: ${creator?.user.email}`);
    console.log(`   Total Earnings: $${creator?.totalEarnings || 0}`);
    console.log(`   Total Purchases: ${creator?.totalPurchases || 0}\n`);

    // Check purchases
    const purchases = await prisma.purchase.findMany({
      where: { 
        content: { creatorId: creator?.id },
        status: 'COMPLETED'
      },
      select: {
        id: true,
        amount: true,
        basePrice: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('   Recent Completed Purchases:');
    purchases.forEach(p => {
      const earnings = p.basePrice ? p.basePrice * 0.9 : p.amount * 0.85;
      console.log(`      - $${p.amount} (earnings: $${earnings.toFixed(2)}) - ${p.createdAt}`);
    });
    console.log('');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

checkCreatorEarnings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
