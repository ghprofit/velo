
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const contentId = 'q6vYp0M0Wo';
  const accessToken = 'dc92a6ce251850ce54232341e47d027063f408be027508a7888ed1001722645e';

  console.log('--- Checking Content ---');
  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });
    console.log('Content:', content);
  } catch (e) {
    console.error('Error fetching content:', e.message);
  }

  console.log('\n--- Checking Purchase by Token ---');
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
      include: {
        content: true,
      }
    });
    console.log('Purchase found:', !!purchase);
    if (purchase) {
      console.log('Purchase ID:', purchase.id);
      console.log('Purchase status:', purchase.status);
      console.log('Purchase content ID:', purchase.contentId);
    }
  } catch (e) {
    console.error('Error fetching purchase:', e.message);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
