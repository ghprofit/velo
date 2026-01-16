const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPurchases() {
  try {
    const purchases = await prisma.purchase.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        amount: true,
        paymentIntentId: true,
        transactionId: true,
        accessToken: true,
        createdAt: true,
        completedAt: true,
        completedBy: true,
        content: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`\n✅ Total recent purchases: ${purchases.length}\n`);
    console.log('='.repeat(80));
    
    purchases.forEach((p, index) => {
      console.log(`\n[${index + 1}] Purchase ID: ${p.id}`);
      console.log(`    Status: ${p.status}`);
      console.log(`    Amount: $${p.amount}`);
      console.log(`    Payment Intent: ${p.paymentIntentId || 'N/A'}`);
      console.log(`    Transaction ID: ${p.transactionId || 'N/A'}`);
      console.log(`    Content: ${p.content.title}`);
      console.log(`    Created: ${p.createdAt}`);
      console.log(`    Completed: ${p.completedAt || 'Not completed'}`);
      console.log(`    Completed By: ${p.completedBy || 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Count by status
    const statusCounts = await prisma.purchase.groupBy({
      by: ['status'],
      _count: true
    });
    
    console.log('\n📊 Purchase Status Summary:');
    statusCounts.forEach(s => {
      console.log(`    ${s.status}: ${s._count}`);
    });
    
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPurchases();
