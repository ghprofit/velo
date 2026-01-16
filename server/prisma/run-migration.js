const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter and Prisma client
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runMigration() {
  try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync(
      path.join(__dirname, 'add-rekognition-columns.sql'),
      'utf-8'
    );

    console.log('Executing SQL migration...');
    await prisma.$executeRawUnsafe(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runMigration();
