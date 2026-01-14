import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,

      // Connection timeouts for Neon serverless
      connectionTimeoutMillis: 30000,  // 30 seconds - wait for Neon to wake up
      idleTimeoutMillis: 30000,        // Close idle clients after 30 seconds
      statement_timeout: 60000,        // 60 seconds for queries

      // Connection pool limits
      max: 5,                          // Neon free tier connection limit
      min: 0,                          // No minimum idle connections

      // SSL/TLS required for Neon
      ssl: {
        rejectUnauthorized: true,      // Verify certificate
      },
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;

    console.log('✓ PostgreSQL connection pool configured for Neon serverless');
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    console.log('Prisma disconnected from database');
  }
}
