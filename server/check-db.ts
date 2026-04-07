
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const contentId = 'q6vYp0M0Wo';
  const accessToken = 'dc92a6ce251850ce54232341e47d027063f408be027508a7888ed1001722645e';

  console.log('--- Checking Content ---');
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });
  console.log('Content:', content);

  console.log('\n--- Checking Purchase by Token ---');
  const purchase = await prisma.purchase.findUnique({
    where: { accessToken },
    include: {
      content: true,
    }
  });
  console.log('Purchase:', purchase);

  if (purchase) {
    console.log('Purchase content ID:', purchase.contentId);
    console.log('Request content ID:', contentId);
    console.log('Mismatch?', purchase.contentId !== contentId);
  } else {
    console.log('No purchase found for this token.');
    
    // Check if any purchase exists for this content
    const anyPurchase = await prisma.purchase.findFirst({
      where: { contentId },
      orderBy: { createdAt: 'desc' },
    });
    console.log('\n--- Latest purchase for this content ---');
    console.log(anyPurchase);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
