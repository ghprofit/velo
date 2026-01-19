import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse and rebuild DATABASE_URL with proper encoding if needed
function getEncodedDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  try {
    new URL(dbUrl);
    return dbUrl;
  } catch (error) {
    const protocolMatch = dbUrl.match(/^(postgresql:\/\/)/);
    if (!protocolMatch) {
      return dbUrl;
    }

    const withoutProtocol = dbUrl.substring(protocolMatch[0].length);
    const lastAtIndex = withoutProtocol.lastIndexOf('@');
    if (lastAtIndex === -1) {
      return dbUrl;
    }

    const authPart = withoutProtocol.substring(0, lastAtIndex);
    const hostPart = withoutProtocol.substring(lastAtIndex + 1);

    const firstColonIndex = authPart.indexOf(':');
    if (firstColonIndex === -1) {
      return dbUrl;
    }

    const user = authPart.substring(0, firstColonIndex);
    const password = authPart.substring(firstColonIndex + 1);

    const hostMatch = hostPart.match(/^([^:]+):(\d+)\/(.+)$/);
    if (!hostMatch) {
      return dbUrl;
    }

    const [, host, port, database] = hostMatch;

    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);

    return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
  }
}

const databaseUrl = getEncodedDatabaseUrl();
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface WaitlistRecord {
  email: string;
  country?: string;
  age?: string;
  heardFrom?: string;
}

async function importWaitlist(csvFilePath: string) {
  try {
    console.log('🚀 Starting waitlist import...\n');

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    // Read CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV (with header row)
    // Expected columns: email, country (optional), age (optional), heardFrom (optional)
    const records = parse(fileContent, {
      columns: true, // Use first row as header
      skip_empty_lines: true,
      trim: true,
    }) as WaitlistRecord[];

    console.log(`📄 Found ${records.length} records in CSV file\n`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of records) {
      try {
        const email = record.email?.toLowerCase().trim();

        if (!email) {
          console.log(`⚠️  Skipping row with missing email`);
          skipped++;
          continue;
        }

        // Check if email already exists
        const existing = await prisma.waitlist.findUnique({
          where: { email },
        });

        if (existing) {
          console.log(`⏭️  Skipping ${email} - already exists`);
          skipped++;
          continue;
        }

        // Check if user already registered
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          console.log(`⏭️  Skipping ${email} - already registered`);
          skipped++;
          continue;
        }

        // Import to waitlist
        await prisma.waitlist.create({
          data: {
            email,
            country: record.country || null,
            age: record.age ? parseInt(record.age) : null,
            heardFrom: record.heardFrom || null,
          },
        });

        console.log(`✅ Imported: ${email}`);
        imported++;
      } catch (error: any) {
        console.error(`❌ Error importing ${record.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Import Summary:');
    console.log(`   Total records: ${records.length}`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (imported > 0) {
      console.log('✨ Waitlist import completed successfully!\n');
    }
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Get CSV file path from command line argument
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('❌ Please provide the path to the CSV file');
  console.log('\nUsage: npm run import-waitlist <path-to-csv-file>');
  console.log('Example: npm run import-waitlist ./waitlist.csv\n');
  process.exit(1);
}

// Resolve the file path
const resolvedPath = path.resolve(csvFilePath);

importWaitlist(resolvedPath)
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
