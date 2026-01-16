// Quick script to verify a specific purchase by access token
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const accessToken = process.argv[2];

if (!accessToken) {
  console.error('Usage: node verify-purchase.js <accessToken>');
  process.exit(1);
}

async function verifyPurchase() {
  try {
    console.log(`\n🔍 Verifying purchase with token: ${accessToken.substring(0, 20)}...\n`);
    console.log('='.repeat(80));

    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
      include: {
        content: {
          select: {
            title: true,
            price: true,
            status: true,
            isPublished: true,
          }
        }
      }
    });

    if (!purchase) {
      console.log('❌ Purchase NOT FOUND in database');
      console.log('\nPossible issues:');
      console.log('  - Token was not saved correctly');
      console.log('  - Purchase was not created');
      console.log('  - Wrong token provided');
      return;
    }

    console.log('✅ Purchase FOUND in database\n');
    console.log(`Purchase Details:`);
    console.log(`  ID: ${purchase.id}`);
    console.log(`  Status: ${purchase.status} ${purchase.status === 'COMPLETED' ? '✅' : '❌'}`);
    console.log(`  Amount: $${purchase.amount}`);
    console.log(`  Payment Intent: ${purchase.paymentIntentId || 'N/A'}`);
    console.log(`  Transaction ID: ${purchase.transactionId || 'N/A'}`);
    console.log(`  Access Token: ${purchase.accessToken.substring(0, 30)}...`);
    console.log(`  Created: ${purchase.createdAt}`);
    console.log(`  Completed: ${purchase.completedAt || 'Not completed'}`);
    console.log(`  Completed By: ${purchase.completedBy || 'N/A'}`);
    console.log(`  Access Expires: ${purchase.accessExpiresAt || 'Never'}`);
    console.log(`\nContent Details:`);
    console.log(`  Title: ${purchase.content.title}`);
    console.log(`  Price: $${purchase.content.price}`);
    console.log(`  Status: ${purchase.content.status}`);
    console.log(`  Published: ${purchase.content.isPublished ? 'Yes ✅' : 'No ❌'}`);

    console.log('\n' + '='.repeat(80));

    // Verify access would work
    if (purchase.status === 'COMPLETED' && purchase.content.isPublished && purchase.content.status === 'APPROVED') {
      console.log('\n✅ VERIFICATION PASSED - User should have access to content');
    } else {
      console.log('\n❌ VERIFICATION FAILED - Access issues detected:');
      if (purchase.status !== 'COMPLETED') {
        console.log(`  - Purchase status is ${purchase.status}, not COMPLETED`);
      }
      if (!purchase.content.isPublished) {
        console.log('  - Content is not published');
      }
      if (purchase.content.status !== 'APPROVED') {
        console.log(`  - Content status is ${purchase.content.status}, not APPROVED`);
      }
    }

    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPurchase();
