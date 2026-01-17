import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function checkAllPurchases() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    const purchases = await prisma.purchase.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        completedAt: true,
        content: {
          select: {
            title: true,
            creator: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`\n📊 Total Purchases: ${purchases.length}\n`);
    
    if (purchases.length === 0) {
      console.log('   No purchases found in the database.\n');
    } else {
      purchases.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.content.title} by ${p.content.creator.displayName}`);
        console.log(`      Amount: $${p.amount}`);
        console.log(`      Status: ${p.status}`);
        console.log(`      Created: ${p.createdAt}`);
        console.log(`      Completed: ${p.completedAt || 'Not completed'}\n`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

checkAllPurchases()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
