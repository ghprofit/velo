import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma with PostgreSQL adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000,
  statement_timeout: 300000,
  max: 5,
  min: 0,
  query_timeout: 300000,
  ssl: {
    rejectUnauthorized: true,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Email to delete
const EMAIL_TO_DELETE = 'nusetorfoster77@gmail.com';

interface DeletionSummary {
  user: boolean;
  creatorProfile: boolean;
  adminProfile: boolean;
  content: number;
  contentItems: number;
  complianceLogs: number;
  purchases: number;
  contentViews: number;
  payouts: number;
  payoutRequests: number;
  refreshTokens: number;
  emailVerificationTokens: number;
  passwordResetTokens: number;
  adminActions: number;
  supportTickets: number;
  notifications: number;
  waitlist: boolean;
}

async function confirmDeletion(email: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `\n⚠️  WARNING: You are about to PERMANENTLY delete all data for ${email}\n` +
        `This action CANNOT be undone!\n\n` +
        `Type "DELETE" to confirm: `,
      (answer) => {
        rl.close();
        resolve(answer.trim() === 'DELETE');
      },
    );
  });
}

async function deleteUserData(email: string): Promise<DeletionSummary> {
  console.log(`\n🔍 Searching for user: ${email}...`);

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      creatorProfile: {
        include: {
          content: {
            include: {
              contentItems: true,
              complianceLogs: true,
              purchases: true,
              contentViews: true,
            },
          },
          payouts: true,
          payoutRequests: true,
        },
      },
      adminProfile: true,
      refreshTokens: true,
      emailVerificationToken: true,
      passwordResetTokens: true,
      adminActions: true,
      supportTickets: {
        include: {
          attachments: true,
        },
      },
      notifications: true,
    },
  });

  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  console.log(`\n✅ User found: ${user.id}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Created: ${user.createdAt.toISOString()}`);

  const summary: DeletionSummary = {
    user: false,
    creatorProfile: false,
    adminProfile: false,
    content: 0,
    contentItems: 0,
    complianceLogs: 0,
    purchases: 0,
    contentViews: 0,
    payouts: 0,
    payoutRequests: 0,
    refreshTokens: 0,
    emailVerificationTokens: 0,
    passwordResetTokens: 0,
    adminActions: 0,
    supportTickets: 0,
    notifications: 0,
    waitlist: false,
  };

  // Display what will be deleted
  console.log('\n📊 Data to be deleted:');
  if (user.creatorProfile) {
    const contentCount = user.creatorProfile.content.length;
    const contentItemsCount = user.creatorProfile.content.reduce(
      (sum, c) => sum + c.contentItems.length,
      0,
    );
    const complianceLogsCount = user.creatorProfile.content.reduce(
      (sum, c) => sum + c.complianceLogs.length,
      0,
    );
    const purchasesCount = user.creatorProfile.content.reduce(
      (sum, c) => sum + c.purchases.length,
      0,
    );
    const viewsCount = user.creatorProfile.content.reduce(
      (sum, c) => sum + c.contentViews.length,
      0,
    );

    console.log(`   Creator Profile: Yes`);
    console.log(`   Content Items: ${contentCount}`);
    console.log(`   Content Media Files: ${contentItemsCount}`);
    console.log(`   Compliance Logs: ${complianceLogsCount}`);
    console.log(`   Purchases: ${purchasesCount}`);
    console.log(`   Content Views: ${viewsCount}`);
    console.log(`   Payouts: ${user.creatorProfile.payouts.length}`);
    console.log(`   Payout Requests: ${user.creatorProfile.payoutRequests.length}`);
  }

  if (user.adminProfile) {
    console.log(`   Admin Profile: Yes`);
  }

  console.log(`   Refresh Tokens: ${user.refreshTokens.length}`);
  console.log(`   Email Verification Tokens: ${user.emailVerificationToken ? 1 : 0}`);
  console.log(`   Password Reset Tokens: ${user.passwordResetTokens.length}`);
  console.log(`   Admin Actions: ${user.adminActions.length}`);
  console.log(`   Support Tickets: ${user.supportTickets.length}`);
  console.log(`   Notifications: ${user.notifications.length}`);

  // Check waitlist
  const waitlistEntry = await prisma.waitlist.findUnique({
    where: { email },
  });
  if (waitlistEntry) {
    console.log(`   Waitlist Entry: Yes`);
  }

  // Get confirmation
  const confirmed = await confirmDeletion(email);
  if (!confirmed) {
    console.log('\n❌ Deletion cancelled');
    process.exit(0);
  }

  console.log('\n🗑️  Starting deletion process...\n');

  try {
    // Start a transaction to ensure all-or-nothing deletion
    await prisma.$transaction(async (tx) => {
      // 1. Delete creator-related data if exists
      if (user.creatorProfile) {
        const creatorId = user.creatorProfile.id;

        // Get all content IDs for this creator
        const contentIds = user.creatorProfile.content.map((c) => c.id);

        if (contentIds.length > 0) {
          // Delete content views
          const deletedViews = await tx.contentView.deleteMany({
            where: { contentId: { in: contentIds } },
          });
          summary.contentViews = deletedViews.count;
          console.log(`   ✓ Deleted ${deletedViews.count} content views`);

          // Delete purchases (will cascade to device verifications if any)
          const deletedPurchases = await tx.purchase.deleteMany({
            where: { contentId: { in: contentIds } },
          });
          summary.purchases = deletedPurchases.count;
          console.log(`   ✓ Deleted ${deletedPurchases.count} purchases`);

          // Delete compliance logs
          const deletedLogs = await tx.complianceLog.deleteMany({
            where: { contentId: { in: contentIds } },
          });
          summary.complianceLogs = deletedLogs.count;
          console.log(`   ✓ Deleted ${deletedLogs.count} compliance logs`);

          // Delete content items (gallery items)
          const deletedItems = await tx.contentItem.deleteMany({
            where: { contentId: { in: contentIds } },
          });
          summary.contentItems = deletedItems.count;
          console.log(`   ✓ Deleted ${deletedItems.count} content items`);

          // Delete content
          const deletedContent = await tx.content.deleteMany({
            where: { creatorId },
          });
          summary.content = deletedContent.count;
          console.log(`   ✓ Deleted ${deletedContent.count} content entries`);
        }

        // Delete payout requests (will cascade payout relation)
        const deletedPayoutRequests = await tx.payoutRequest.deleteMany({
          where: { creatorId },
        });
        summary.payoutRequests = deletedPayoutRequests.count;
        console.log(`   ✓ Deleted ${deletedPayoutRequests.count} payout requests`);

        // Delete payouts
        const deletedPayouts = await tx.payout.deleteMany({
          where: { creatorId },
        });
        summary.payouts = deletedPayouts.count;
        console.log(`   ✓ Deleted ${deletedPayouts.count} payouts`);

        // Delete creator profile
        await tx.creatorProfile.delete({
          where: { id: creatorId },
        });
        summary.creatorProfile = true;
        console.log(`   ✓ Deleted creator profile`);
      }

      // 2. Delete admin profile if exists
      if (user.adminProfile) {
        await tx.adminProfile.delete({
          where: { id: user.adminProfile.id },
        });
        summary.adminProfile = true;
        console.log(`   ✓ Deleted admin profile`);
      }

      // 3. Delete support tickets and attachments
      if (user.supportTickets.length > 0) {
        const ticketIds = user.supportTickets.map((t) => t.id);

        // Delete support attachments
        await tx.supportAttachment.deleteMany({
          where: { ticketId: { in: ticketIds } },
        });

        // Delete support tickets
        const deletedTickets = await tx.supportTicket.deleteMany({
          where: { userId: user.id },
        });
        summary.supportTickets = deletedTickets.count;
        console.log(`   ✓ Deleted ${deletedTickets.count} support tickets`);
      }

      // 4. Delete notifications
      const deletedNotifications = await tx.notification.deleteMany({
        where: { userId: user.id },
      });
      summary.notifications = deletedNotifications.count;
      console.log(`   ✓ Deleted ${deletedNotifications.count} notifications`);

      // 5. Delete admin actions (actions performed by this user if admin)
      const deletedAdminActions = await tx.adminAction.deleteMany({
        where: { adminId: user.id },
      });
      summary.adminActions = deletedAdminActions.count;
      console.log(`   ✓ Deleted ${deletedAdminActions.count} admin actions`);

      // 6. Delete authentication tokens
      const deletedRefreshTokens = await tx.refreshToken.deleteMany({
        where: { userId: user.id },
      });
      summary.refreshTokens = deletedRefreshTokens.count;
      console.log(`   ✓ Deleted ${deletedRefreshTokens.count} refresh tokens`);

      if (user.emailVerificationToken) {
        await tx.emailVerificationToken.delete({
          where: { id: user.emailVerificationToken.id },
        });
        summary.emailVerificationTokens = 1;
        console.log(`   ✓ Deleted email verification token`);
      }

      const deletedPasswordResetTokens = await tx.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      summary.passwordResetTokens = deletedPasswordResetTokens.count;
      console.log(`   ✓ Deleted ${deletedPasswordResetTokens.count} password reset tokens`);

      // 7. Delete user account
      await tx.user.delete({
        where: { id: user.id },
      });
      summary.user = true;
      console.log(`   ✓ Deleted user account`);

      // 8. Delete waitlist entry if exists (outside user relation)
      if (waitlistEntry) {
        await tx.waitlist.delete({
          where: { email },
        });
        summary.waitlist = true;
        console.log(`   ✓ Deleted waitlist entry`);
      }
    });

    console.log('\n✅ Deletion completed successfully!\n');
    return summary;
  } catch (error) {
    console.error('\n❌ Error during deletion:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('   USER DATA DELETION SCRIPT');
    console.log('═══════════════════════════════════════════════════');

    const summary = await deleteUserData(EMAIL_TO_DELETE);

    console.log('═══════════════════════════════════════════════════');
    console.log('   DELETION SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`User Account: ${summary.user ? 'Deleted' : 'Not Found'}`);
    console.log(`Creator Profile: ${summary.creatorProfile ? 'Deleted' : 'N/A'}`);
    console.log(`Admin Profile: ${summary.adminProfile ? 'Deleted' : 'N/A'}`);
    console.log(`Content: ${summary.content}`);
    console.log(`Content Items: ${summary.contentItems}`);
    console.log(`Compliance Logs: ${summary.complianceLogs}`);
    console.log(`Purchases: ${summary.purchases}`);
    console.log(`Content Views: ${summary.contentViews}`);
    console.log(`Payouts: ${summary.payouts}`);
    console.log(`Payout Requests: ${summary.payoutRequests}`);
    console.log(`Refresh Tokens: ${summary.refreshTokens}`);
    console.log(`Email Verification Tokens: ${summary.emailVerificationTokens}`);
    console.log(`Password Reset Tokens: ${summary.passwordResetTokens}`);
    console.log(`Admin Actions: ${summary.adminActions}`);
    console.log(`Support Tickets: ${summary.supportTickets}`);
    console.log(`Notifications: ${summary.notifications}`);
    console.log(`Waitlist Entry: ${summary.waitlist ? 'Deleted' : 'N/A'}`);
    console.log('═══════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
