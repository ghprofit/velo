const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSuperAdmins() {
  try {
    const superAdmins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN',
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log('\n=== Super Admin Users ===');
    console.log(JSON.stringify(superAdmins, null, 2));
    console.log(`\nTotal: ${superAdmins.length} user(s)\n`);

    // Also check ALL users to see their roles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
      take: 10,
    });

    console.log('\n=== All Users (first 10) ===');
    console.log(JSON.stringify(allUsers, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmins();
