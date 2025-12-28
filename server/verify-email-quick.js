const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAllEmails() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        emailVerified: false,
      },
      data: {
        emailVerified: true,
      },
    });

    console.log(`✅ Successfully verified ${result.count} user email(s)`);

    // List all users with their verification status
    const users = await prisma.user.findMany({
      select: {
        email: true,
        emailVerified: true,
        creatorProfile: {
          select: {
            verificationStatus: true,
          },
        },
      },
    });

    console.log('\n📋 User Verification Status:');
    users.forEach((user) => {
      console.log(`  • ${user.email}`);
      console.log(`    - Email Verified: ${user.emailVerified}`);
      console.log(`    - KYC Status: ${user.creatorProfile?.verificationStatus || 'N/A'}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllEmails();
