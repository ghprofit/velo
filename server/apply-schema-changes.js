require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function applySchemaChanges() {
  console.log('\n📦 Applying Schema Changes\n');
  console.log('=' .repeat(50));

  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Apply schema changes using raw SQL
    console.log('\n🔄 Applying schema migrations...\n');

    // 1. Drop existing email_verification_tokens unique constraint on token
    console.log('1. Dropping token unique constraint...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "email_verification_tokens"
      DROP CONSTRAINT IF EXISTS "email_verification_tokens_token_key";
    `);

    // 2. Drop token index
    console.log('2. Dropping token index...');
    await prisma.$executeRawUnsafe(`
      DROP INDEX IF EXISTS "email_verification_tokens_token_idx";
    `);

    // 3. Rename token column to code
    console.log('3. Renaming token to code...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "email_verification_tokens"
      RENAME COLUMN "token" TO "code";
    `);

    // 4. Add new columns
    console.log('4. Adding resendCount column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "email_verification_tokens"
      ADD COLUMN IF NOT EXISTS "resendCount" INTEGER NOT NULL DEFAULT 0;
    `);

    console.log('5. Adding lastResendAt column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "email_verification_tokens"
      ADD COLUMN IF NOT EXISTS "lastResendAt" TIMESTAMP(3);
    `);

    // 5. Create new index on code
    console.log('6. Creating code index...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "email_verification_tokens_code_idx"
      ON "email_verification_tokens"("code");
    `);

    // 6. Create PayoutRequestStatus enum
    console.log('7. Creating PayoutRequestStatus enum...');
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "PayoutRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 7. Create payout_requests table
    console.log('8. Creating payout_requests table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "payout_requests" (
        "id" TEXT NOT NULL,
        "creatorId" TEXT NOT NULL,
        "requestedAmount" DOUBLE PRECISION NOT NULL,
        "availableBalance" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "status" "PayoutRequestStatus" NOT NULL DEFAULT 'PENDING',
        "emailVerifiedAt" TIMESTAMP(3),
        "kycVerifiedAt" TIMESTAMP(3),
        "bankSetupAt" TIMESTAMP(3),
        "reviewedBy" TEXT,
        "reviewedAt" TIMESTAMP(3),
        "reviewNotes" TEXT,
        "payoutId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "payout_requests_pkey" PRIMARY KEY ("id")
      );
    `);

    // 8. Create indexes on payout_requests
    console.log('9. Creating payout_requests indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "payout_requests_creatorId_idx" ON "payout_requests"("creatorId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "payout_requests_status_idx" ON "payout_requests"("status");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "payout_requests_payoutId_key" ON "payout_requests"("payoutId");
    `);

    // 9. Add foreign keys
    console.log('10. Adding foreign keys...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payout_requests"
      ADD CONSTRAINT "payout_requests_creatorId_fkey"
      FOREIGN KEY ("creatorId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payout_requests"
      ADD CONSTRAINT "payout_requests_payoutId_fkey"
      FOREIGN KEY ("payoutId") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `);

    console.log('\n✅ Schema changes applied successfully!\n');
    console.log('=' .repeat(50));

    // Verify changes
    console.log('\n🔍 Verifying changes...\n');
    const verificationToken = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'email_verification_tokens'
      ORDER BY ordinal_position;
    `;
    console.log('EmailVerificationToken columns:', verificationToken);

    const payoutRequestCount = await prisma.payoutRequest.count();
    console.log(`\nPayoutRequest table created: ${payoutRequestCount} records\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

applySchemaChanges();
