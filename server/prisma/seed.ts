import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

// Load environment variables
config();

// Parse and rebuild DATABASE_URL with proper encoding if needed
function getEncodedDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  try {
    // Try parsing as URL - if it fails, it has unencoded characters
    new URL(dbUrl);
    return dbUrl; // Already properly encoded
  } catch (error) {
    // Manual parsing for postgresql://user:password@host:port/database
    const match = dbUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
    if (!match) {
      // Return as-is and let it fail with original error
      return dbUrl;
    }

    const [, user, password, host, port, database] = match;

    // Encode username and password
    const encodedUser = encodeURIComponent(user!);
    const encodedPassword = encodeURIComponent(password!);

    return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
  }
}

const databaseUrl = getEncodedDatabaseUrl();
const pool = new Pool({
  connectionString: databaseUrl,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@velo.com' },
    update: {},
    create: {
      email: 'superadmin@velo.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@velo.com' },
    update: {},
    create: {
      email: 'admin@velo.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create test creator
  const creator = await prisma.user.upsert({
    where: { email: 'creator@velo.com' },
    update: {},
    create: {
      email: 'creator@velo.com',
      password: hashedPassword,
      role: 'CREATOR',
      emailVerified: true,
      isActive: true,
      creatorProfile: {
        create: {
          displayName: 'Test Creator',
          firstName: 'Test',
          lastName: 'Creator',
          country: 'US',
        },
      },
    },
  });

  console.log('✅ Creator created:', creator.email);

  console.log('\n📝 Login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin: superadmin@velo.com / Admin@123');
  console.log('Admin:       admin@velo.com / Admin@123');
  console.log('Creator:     creator@velo.com / Admin@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
