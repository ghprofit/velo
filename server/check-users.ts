import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('\n=== All Users ===');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
      take: 20,
    });

    console.log(JSON.stringify(users, null, 2));
    console.log(`\nTotal users found: ${users.length}`);

    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
    console.log(`\nSuper Admins: ${superAdmins.length}`);

    if (users.length > 0 && superAdmins.length === 0) {
      console.log('\n⚠️  No SUPER_ADMIN users found!');
      console.log('You can update a user to SUPER_ADMIN in Prisma Studio:');
      console.log('http://localhost:5555');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
