// Test content access - find recent purchase and show access URL
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testContentAccess() {
  try {
    console.log('\n🔍 Finding most recent completed purchase...\n');
    
    const purchase = await prisma.purchase.findFirst({
      where: {
        status: 'COMPLETED',
      },
      include: {
        content: {
          include: {
            contentItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!purchase) {
      console.log('❌ No completed purchases found');
      return;
    }

    console.log('✅ Found purchase:');
    console.log('   Purchase ID:', purchase.id);
    console.log('   Access Token:', purchase.accessToken);
    console.log('   Content ID:', purchase.contentId);
    console.log('   Content Title:', purchase.content.title);
    console.log('   Content Type:', purchase.content.contentType);
    console.log('   Status:', purchase.status);
    console.log('   Created:', purchase.createdAt);
    console.log('\n📦 Content Items:');
    console.log('   Total Items:', purchase.content.contentItems.length);
    
    purchase.content.contentItems.forEach((item, index) => {
      console.log(`   [${index + 1}] ID: ${item.id}`);
      console.log(`       S3 Key: ${item.s3Key}`);
      console.log(`       Bucket: ${item.s3Bucket}`);
      console.log(`       Order: ${item.order}`);
    });

    console.log('\n🔗 Test Content Access URL:');
    const baseUrl = 'http://localhost:3001'; // Adjust if needed
    console.log(`   ${baseUrl}/c/${purchase.content.shortId}?token=${purchase.accessToken}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContentAccess();
