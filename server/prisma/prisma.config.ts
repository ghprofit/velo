import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load environment variables from .env file
config();

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_DeqHGsRhp6L7@ep-wandering-meadow-adz3ni25-pooler.c-2.us-east-1.aws.neon.tech/velo?sslmode=require',
  },
});
