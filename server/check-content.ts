
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- Listing Content IDs ---');
  const contents = await prisma.content.findMany({
    take: 10,
    select: { id: true, title: true }
  });
  console.log(contents);

  const targetId = 'q6vYp0M0Wo';
  const content = await prisma.content.findUnique({
    where: { id: targetId }
  });
  console.log(`\nChecking for ${targetId}:`, content ? 'FOUND' : 'NOT FOUND');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
