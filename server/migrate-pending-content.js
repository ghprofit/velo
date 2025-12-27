/**
 * Migration Script: Update PENDING_REVIEW content to APPROVED
 *
 * This script updates all content with status 'PENDING_REVIEW' to 'APPROVED'
 * so they become visible to buyers and creators.
 *
 * Usage:
 *   node migrate-pending-content.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePendingContent() {
  console.log('\n📦 Content Status Migration\n');
  console.log('='.repeat(50));

  try {
    // Find all content with PENDING_REVIEW status
    const pendingContent = await prisma.content.findMany({
      where: {
        status: 'PENDING_REVIEW',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        creator: {
          select: {
            displayName: true,
          },
        },
      },
    });

    console.log(`\nFound ${pendingContent.length} content(s) with PENDING_REVIEW status\n`);

    if (pendingContent.length === 0) {
      console.log('✅ No content to migrate. All content is already approved or has other statuses.\n');
      return;
    }

    // Display content to be updated
    console.log('Content to be approved:\n');
    pendingContent.forEach((content, index) => {
      console.log(`${index + 1}. "${content.title}" by ${content.creator.displayName} (ID: ${content.id})`);
      console.log(`   Created: ${content.createdAt.toLocaleDateString()}\n`);
    });

    // Update all to APPROVED
    console.log('Updating status to APPROVED...\n');

    const result = await prisma.content.updateMany({
      where: {
        status: 'PENDING_REVIEW',
      },
      data: {
        status: 'APPROVED',
      },
    });

    console.log(`✅ Successfully updated ${result.count} content(s) to APPROVED status\n`);
    console.log('='.repeat(50));
    console.log('\n✨ Migration completed successfully!\n');

    // Show current status distribution
    const statusCounts = await prisma.content.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('Current content status distribution:');
    statusCounts.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count} content(s)`);
    });
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migratePendingContent();
