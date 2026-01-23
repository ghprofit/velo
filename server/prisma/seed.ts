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

  console.log('Processing DATABASE_URL...');

  try {
    // Try parsing as URL - if it fails, it has unencoded characters
    new URL(dbUrl);
    console.log('DATABASE_URL is already properly formatted');
    return dbUrl; // Already properly encoded
  } catch (error) {
    console.log('DATABASE_URL has encoding issues, attempting to fix...');

    // More robust parsing: postgresql://user:password@host:port/database
    // We need to handle passwords that might contain @ or other special chars
    const protocolMatch = dbUrl.match(/^(postgresql:\/\/)/);
    if (!protocolMatch) {
      console.error('Invalid DATABASE_URL format: missing postgresql:// protocol');
      return dbUrl;
    }

    // Remove protocol
    const withoutProtocol = dbUrl.substring(protocolMatch[0].length);

    // Split by the LAST @ to separate auth from host
    const lastAtIndex = withoutProtocol.lastIndexOf('@');
    if (lastAtIndex === -1) {
      console.error('Invalid DATABASE_URL format: missing @ separator');
      return dbUrl;
    }

    const authPart = withoutProtocol.substring(0, lastAtIndex);
    const hostPart = withoutProtocol.substring(lastAtIndex + 1);

    // Split auth into user:password (only split on FIRST colon)
    const firstColonIndex = authPart.indexOf(':');
    if (firstColonIndex === -1) {
      console.error('Invalid DATABASE_URL format: missing password');
      return dbUrl;
    }

    const user = authPart.substring(0, firstColonIndex);
    const password = authPart.substring(firstColonIndex + 1);

    // Parse host:port/database
    const hostMatch = hostPart.match(/^([^:]+):(\d+)\/(.+)$/);
    if (!hostMatch) {
      console.error('Invalid DATABASE_URL format: invalid host/port/database format');
      return dbUrl;
    }

    const [, host, port, database] = hostMatch;

    // Encode username and password
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);

    const newUrl = `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
    console.log('DATABASE_URL encoding complete');
    return newUrl;
  }
}

const databaseUrl = getEncodedDatabaseUrl();
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Accept self-signed certificates from AWS RDS
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function applySchemaPatches() {
  console.log('Ensuring schema is up to date for seeding...');

  const statements = [
    // Enum value for payout status
    `ALTER TYPE "PayoutStatus" ADD VALUE IF NOT EXISTS 'PENDING';`,

    // User 2FA & profile fields
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "backupCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorVerifiedAt" TIMESTAMP(3);`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "displayName" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifyPayoutUpdates" BOOLEAN NOT NULL DEFAULT true;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifyContentEngagement" BOOLEAN NOT NULL DEFAULT true;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifyPlatformAnnouncements" BOOLEAN NOT NULL DEFAULT true;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifyMarketingEmails" BOOLEAN NOT NULL DEFAULT false;`,

    // Creator profile payout/banking fields
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "allowBuyerProfileView" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankName" TEXT;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankRoutingNumber" TEXT;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankSwiftCode" TEXT;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankIban" TEXT;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankCountry" TEXT;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bankCurrency" TEXT NOT NULL DEFAULT 'USD';`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "payoutSetupCompleted" BOOLEAN NOT NULL DEFAULT false;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "waitlistBonus" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
    `ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "bonusWithdrawn" BOOLEAN NOT NULL DEFAULT false;`,
  ];

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      console.warn(`Skipping statement due to error: ${stmt}`, err);
    }
  }
}

async function main() {
  console.log('Seeding database...');

  // Make sure required columns/enum values exist even if migrations lag behind
  await applySchemaPatches();

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'akwaracyril@gmail.com' },
    update: {},
    create: {
      email: 'akwaracyril@gmail.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'mullinsroyyy@gmail.com' },
    update: {},
    create: {
      email: 'mullinsroyyy@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin created:', admin.email);

  console.log('\n📝 Login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin: akwaracyril@gmail.com / Admin@123');
  console.log('Admin:       mullinsroyyy@gmail.com / Admin@123');
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
