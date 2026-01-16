require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSuperAdmin() {
  try {
    console.log('\n=== Current Users ===');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
      take: 10,
    });
    
    console.log(JSON.stringify(users, null, 2));
    
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n=== Updating ${firstUser.email} to SUPER_ADMIN ===`);
      
      const updated = await prisma.user.update({
        where: { id: firstUser.id },
        data: { role: 'SUPER_ADMIN' },
      });
      
      console.log('\nUpdated user:');
      console.log(JSON.stringify(updated, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdmin();
