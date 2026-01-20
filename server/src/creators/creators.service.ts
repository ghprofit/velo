import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VeriffService } from '../veriff/veriff.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StripeService } from '../stripe/stripe.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { CreateSessionDto } from '../veriff/dto';
import { VerificationStatus } from '@prisma/client';
import { SetupBankAccountDto, BankAccountResponseDto } from './dto/bank-account.dto';

@Injectable()
export class CreatorsService {
  private readonly logger = new Logger(CreatorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly veriffService: VeriffService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Initiate identity verification for a creator
   */
  async initiateVerification(userId: string) {
    try {
      this.logger.log(`Initiating verification for user: ${userId}`);

      // Get user and creator profile
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.creatorProfile) {
        throw new BadRequestException('Creator profile not found');
      }

      // Check if already verified
      if (user.creatorProfile.verificationStatus === VerificationStatus.VERIFIED) {
        throw new BadRequestException('Creator is already verified');
      }

      // Check if there's an active verification session
      if (user.creatorProfile.veriffSessionId) {
        this.logger.warn(`User ${userId} already has an active verification session`);
        // You could optionally check the status of the existing session here
      }

      // Prepare Veriff session data
      // IMPORTANT: callback must point to API webhook endpoint, NOT frontend
      const apiUrl = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:8000';
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      
      // Log the data being sent for debugging
      this.logger.log(`Creator profile data: firstName=${user.creatorProfile.firstName}, lastName=${user.creatorProfile.lastName}, dateOfBirth=${user.creatorProfile.dateOfBirth}`);
      
      const sessionData: CreateSessionDto = {
        verification: {
          callback: `${apiUrl}/api/veriff/webhooks/decision`,
          person: {
            firstName: user.creatorProfile.firstName || undefined,
            lastName: user.creatorProfile.lastName || undefined,
            dateOfBirth: user.creatorProfile.dateOfBirth
              ? user.creatorProfile.dateOfBirth.toISOString().split('T')[0]
              : undefined,
          },
          vendorData: userId, // Store user ID for webhook processing
        },
      };
      
      this.logger.log(`Veriff session data: ${JSON.stringify(sessionData, null, 2)}`);

      // Create Veriff session
      const session = await this.veriffService.createSession(sessionData);

      // Update creator profile with session ID
      await this.prisma.creatorProfile.update({
        where: { id: user.creatorProfile.id },
        data: {
          veriffSessionId: session.verification.id,
          verificationStatus: VerificationStatus.IN_PROGRESS,
        },
      });

      this.logger.log(
        `Verification session created: ${session.verification.id} for user ${userId}`,
      );

      return {
        sessionId: session.verification.id,
        verificationUrl: session.verification.url,
        status: session.verification.status,
      };
    } catch (error) {
      this.logger.error(`Failed to initiate verification for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get verification status for the current user
   */
  async getMyVerificationStatus(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user || !user.creatorProfile) {
        throw new NotFoundException('Creator profile not found');
      }

      return {
        verificationStatus: user.creatorProfile.verificationStatus,
        veriffSessionId: user.creatorProfile.veriffSessionId,
        verifiedAt: user.creatorProfile.verifiedAt,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      this.logger.error(`Failed to get verification status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Process webhook decision from Veriff
   */
  async processVeriffWebhook(sessionId: string, status: string, code: number, vendorData?: string) {
    try {
      this.logger.log(`Processing Veriff webhook for session: ${sessionId}`);

      // Find creator profile by session ID
      const creatorProfile = await this.prisma.creatorProfile.findUnique({
        where: { veriffSessionId: sessionId },
        include: { user: true },
      });

      if (!creatorProfile) {
        this.logger.warn(`No creator profile found for session: ${sessionId}`);
        return;
      }

      let verificationStatus: VerificationStatus;
      let verifiedAt: Date | null = null;

      if (status === 'approved' && code === 9001) {
        verificationStatus = VerificationStatus.VERIFIED;
        verifiedAt = new Date();
        this.logger.log(`Verification approved for creator: ${creatorProfile.id}`);
      } else if (status === 'declined' && code === 9103) {
        verificationStatus = VerificationStatus.REJECTED;
        this.logger.log(`Verification declined for creator: ${creatorProfile.id}`);
      } else if (code === 9102) {
        // Resubmission required - keep as IN_PROGRESS
        verificationStatus = VerificationStatus.IN_PROGRESS;
        this.logger.log(`Resubmission required for creator: ${creatorProfile.id}`);
      } else {
        // Other statuses - keep current status
        this.logger.log(`Unknown status/code for creator ${creatorProfile.id}: ${status}/${code}`);
        return;
      }

      // Update creator profile
      await this.prisma.creatorProfile.update({
        where: { id: creatorProfile.id },
        data: {
          verificationStatus,
          verifiedAt,
          veriffDecisionId: sessionId,
        },
      });

      this.logger.log(`Updated verification status for creator ${creatorProfile.id}: ${verificationStatus}`);

      // Send verification status email
      const emailSubject = verificationStatus === VerificationStatus.VERIFIED
        ? 'Identity Verification Approved'
        : 'Identity Verification Update';

      const emailMessage = verificationStatus === VerificationStatus.VERIFIED
        ? `Congratulations! Your identity has been verified. You can now upload content.`
        : `Your identity verification status has been updated to: ${verificationStatus}`;

      try {
        await this.emailService.sendEmail({
          to: creatorProfile.user.email,
          subject: emailSubject,
          html: emailMessage,
        });
        this.logger.log(`Verification status email sent to ${creatorProfile.user.email}`);
      } catch (error) {
        this.logger.error('Failed to send verification email:', error);
      }

    } catch (error) {
      this.logger.error(`Failed to process webhook for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Setup bank account for payout
   */
  async setupBankAccount(userId: string, bankAccountDto: SetupBankAccountDto): Promise<BankAccountResponseDto> {
    try {
      this.logger.log(`Setting up bank account for user: ${userId}`);

      // Get user and creator profile
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user || !user.creatorProfile) {
        throw new NotFoundException('Creator profile not found');
      }

      // Check if creator is verified
      if (user.creatorProfile.verificationStatus !== VerificationStatus.VERIFIED) {
        throw new BadRequestException('Creator must be verified before setting up payout');
      }

      // Create or get Stripe Connect account
      let stripeAccountId = user.creatorProfile.stripeAccountId;

      if (!stripeAccountId) {
        this.logger.log(`Creating Stripe Connect account for user: ${userId}`);
        
        const stripeAccount = await this.stripeService.createConnectAccount(
          user.email,
          {
            userId: user.id,
            creatorId: user.creatorProfile.id,
            displayName: user.creatorProfile.displayName,
          },
        );

        stripeAccountId = stripeAccount.id;
        this.logger.log(`Stripe Connect account created: ${stripeAccountId}`);
      }

      // Update creator profile with bank account info and Stripe account
      const updatedProfile = await this.prisma.creatorProfile.update({
        where: { id: user.creatorProfile.id },
        data: {
          bankAccountName: bankAccountDto.bankAccountName,
          bankName: bankAccountDto.bankName,
          bankAccountNumber: bankAccountDto.bankAccountNumber,
          bankRoutingNumber: bankAccountDto.bankRoutingNumber,
          bankSwiftCode: bankAccountDto.bankSwiftCode,
          bankIban: bankAccountDto.bankIban,
          bankCountry: bankAccountDto.bankCountry,
          bankCurrency: bankAccountDto.bankCurrency || 'USD',
          stripeAccountId,
          payoutSetupCompleted: true,
        },
      });

      this.logger.log(`Bank account setup completed for user: ${userId}`);

      // Return sanitized bank account info (hide full account number)
      return {
        bankAccountName: updatedProfile.bankAccountName!,
        bankName: updatedProfile.bankName!,
        bankAccountNumber: `****${updatedProfile.bankAccountNumber!.slice(-4)}`,
        bankCountry: updatedProfile.bankCountry!,
        bankCurrency: updatedProfile.bankCurrency!,
        payoutSetupCompleted: updatedProfile.payoutSetupCompleted,
        stripeAccountId: updatedProfile.stripeAccountId!,
      };
    } catch (error) {
      this.logger.error(`Failed to setup bank account for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get bank account information
   */
  async getBankAccount(userId: string): Promise<BankAccountResponseDto | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user || !user.creatorProfile) {
        throw new NotFoundException('Creator profile not found');
      }

      const profile = user.creatorProfile;

      if (!profile.payoutSetupCompleted) {
        return null;
      }

      return {
        bankAccountName: profile.bankAccountName!,
        bankName: profile.bankName!,
        bankAccountNumber: `****${profile.bankAccountNumber!.slice(-4)}`,
        bankCountry: profile.bankCountry!,
        bankCurrency: profile.bankCurrency!,
        payoutSetupCompleted: profile.payoutSetupCompleted,
        stripeAccountId: profile.stripeAccountId || undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get bank account for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Request a payout
   * Requires: email verified, KYC verified, bank details set
   */
  async requestPayout(userId: string, requestedAmount: number) {
    try {
      this.logger.log(`Payout request initiated by user: ${userId} for amount: ${requestedAmount}`);

      // Wrap entire operation in transaction to prevent race conditions
      const result = await this.prisma.$transaction(
        async (tx) => {
          // Get user with creator profile (within transaction)
          const user = await tx.user.findUnique({
            where: { id: userId },
            include: { creatorProfile: true },
          });

          if (!user || !user.creatorProfile) {
            throw new NotFoundException('Creator profile not found');
          }

          // Validate minimum payout amount
          if (requestedAmount < 50) {
            throw new BadRequestException('Minimum payout amount is $50');
          }

          // Get available balance from profile (released after 24hr pending period)
          let availableBalance = user.creatorProfile.availableBalance || 0;

          // Subtract already requested/processing payouts from available balance
          const activePayoutsAggregation = await tx.payoutRequest.aggregate({
            where: {
              creatorId: user.creatorProfile.id,
              status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
            },
            _sum: {
              requestedAmount: true,
            },
          });

          const reservedForPayouts = activePayoutsAggregation._sum.requestedAmount || 0;
          availableBalance = Math.max(0, availableBalance - reservedForPayouts);

          // Check if waitlist bonus should be added to available balance
          // Bonus is separate from earnings and is only unlocked after 5 sales
          let bonusMessage = '';
          if (user.creatorProfile.waitlistBonus > 0 && !user.creatorProfile.bonusWithdrawn) {
            if (user.creatorProfile.totalPurchases >= 5) {
              // Bonus is unlocked - add to available balance
              availableBalance = availableBalance + user.creatorProfile.waitlistBonus;
            } else {
              // Bonus is locked - track for informational purposes but don't modify balance
              const remainingSales = 5 - user.creatorProfile.totalPurchases;
              bonusMessage = ` (Plus $${user.creatorProfile.waitlistBonus.toFixed(2)} bonus unlocks after ${remainingSales} more sale${remainingSales > 1 ? 's' : ''})`;
            }
          }

          // Validate available balance (locked within transaction)
          if (requestedAmount > availableBalance) {
            throw new BadRequestException(
              `Insufficient balance. Available: $${availableBalance.toFixed(2)}${bonusMessage}, Requested: $${requestedAmount.toFixed(2)}`,
            );
          }

          // Check if there's already a pending payout request (within transaction)
          const existingPendingRequest = await tx.payoutRequest.findFirst({
            where: {
              creatorId: user.creatorProfile.id,
              status: 'PENDING',
            },
          });

          if (existingPendingRequest) {
            throw new BadRequestException('You already have a pending payout request');
          }

          // Create payout request with verification timestamps (within transaction)
          const payoutRequest = await tx.payoutRequest.create({
            data: {
              creatorId: user.creatorProfile.id,
              requestedAmount,
              // Removed availableBalance - calculate dynamically (Bug #4)
              currency: user.creatorProfile.bankCurrency || 'USD',
              status: 'PENDING',
              emailVerifiedAt: user.emailVerified ? new Date() : null,
              kycVerifiedAt: user.creatorProfile.verificationStatus === VerificationStatus.VERIFIED
                ? user.creatorProfile.verifiedAt
                : null,
              bankSetupAt: user.creatorProfile.payoutSetupCompleted ? new Date() : null,
            },
          });

          this.logger.log(`Payout request created: ${payoutRequest.id} for user ${userId}`);

          return {
            payoutRequest,
            user,
            availableBalance,
          };
        },
        { maxWait: 5000, timeout: 10000 },
      );

      // Notify all admins about new payout request (outside transaction)
      try {
        // Null check for TypeScript (should never happen as transaction logic requires it)
        if (!result.user.creatorProfile) {
          throw new Error('Creator profile not found after transaction');
        }

        await this.notificationsService.notifyAdmins(
          NotificationType.PAYOUT_REQUEST,
          'New Payout Request',
          `${result.user.creatorProfile.displayName} has requested a payout of $${requestedAmount.toFixed(2)}`,
          {
            requestId: result.payoutRequest.id,
            creatorId: result.user.creatorProfile.id,
            creatorName: result.user.creatorProfile.displayName,
            amount: requestedAmount,
            availableBalance: result.availableBalance,
          },
        );

        // Get all admin and superadmin emails
        const admins = await this.prisma.user.findMany({
          where: {
            role: { in: ['ADMIN', 'SUPER_ADMIN'] },
            isActive: true,
          },
          select: { email: true },
        });

        // Send email alert to each admin
        const emailData = {
          creator_name: result.user.creatorProfile.displayName,
          amount: `${requestedAmount.toFixed(2)}`,
          request_id: result.payoutRequest.id,
          available_balance: `${result.availableBalance.toFixed(2)}`,
        };

        for (const admin of admins) {
          try {
            await this.emailService.sendAdminPayoutAlert(admin.email, emailData);
          } catch (emailError) {
            this.logger.error(`Failed to send payout alert email to ${admin.email}:`, emailError);
          }
        }

        this.logger.log(`Admin notifications sent for payout request: ${result.payoutRequest.id}`);
      } catch (notificationError) {
        // Log notification error but don't fail the payout request
        this.logger.error(`Failed to send admin notifications for payout request ${result.payoutRequest.id}:`, notificationError);
      }

      return {
        id: result.payoutRequest.id,
        requestedAmount: result.payoutRequest.requestedAmount,
        availableBalance: result.availableBalance,
        currency: result.payoutRequest.currency,
        status: result.payoutRequest.status,
        createdAt: result.payoutRequest.createdAt,
        message: 'Payout request submitted successfully. It will be reviewed by our team.',
      };
    } catch (error) {
      this.logger.error(`Failed to create payout request for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all payout requests for a creator
   */
  async getPayoutRequests(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user || !user.creatorProfile) {
        throw new NotFoundException('Creator profile not found');
      }

      const requests = await this.prisma.payoutRequest.findMany({
        where: { creatorId: user.creatorProfile.id },
        orderBy: { createdAt: 'desc' },
        include: {
          payout: {
            select: {
              id: true,
              amount: true,
              status: true,
              processedAt: true,
              paymentId: true,
            },
          },
        },
      });

      // Calculate total completed payouts
      const completedPayouts = await this.prisma.payout.aggregate({
        where: {
          creatorId: user.creatorProfile.id,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      });

      const totalPayouts = completedPayouts._sum.amount || 0;

      // Calculate current available balance: totalEarnings - completedPayouts
      // Earnings are immediately available after purchase - no pending period
      let currentBalance = user.creatorProfile.totalEarnings - totalPayouts;

      // Add unlocked waitlist bonus to available balance if applicable
      if (user.creatorProfile.waitlistBonus > 0 && !user.creatorProfile.bonusWithdrawn) {
        if (user.creatorProfile.totalPurchases >= 5) {
          // Bonus is unlocked - add to available balance
          currentBalance = currentBalance + user.creatorProfile.waitlistBonus;
        }
      }

      return requests.map(request => ({
        id: request.id,
        requestedAmount: request.requestedAmount,
        availableBalance: currentBalance, // Use current balance, not stale snapshot
        currency: request.currency,
        status: request.status,
        reviewedAt: request.reviewedAt,
        reviewNotes: request.reviewNotes,
        createdAt: request.createdAt,
        payout: request.payout,
      }));
    } catch (error) {
      this.logger.error(`Failed to get payout requests for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific payout request by ID
   */
  async getPayoutRequestById(userId: string, requestId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user || !user.creatorProfile) {
        throw new NotFoundException('Creator profile not found');
      }

      const request = await this.prisma.payoutRequest.findFirst({
        where: {
          id: requestId,
          creatorId: user.creatorProfile.id,
        },
        include: {
          payout: {
            select: {
              id: true,
              amount: true,
              status: true,
              processedAt: true,
              paymentId: true,
              notes: true,
            },
          },
        },
      });

      if (!request) {
        throw new NotFoundException('Payout request not found');
      }

      // Calculate current available balance from totalEarnings (Bug #4 fix)
      const currentBalance = user.creatorProfile.totalEarnings;

      return {
        id: request.id,
        requestedAmount: request.requestedAmount,
        availableBalance: currentBalance, // Use current balance, not stale snapshot
        currency: request.currency,
        status: request.status,
        emailVerifiedAt: request.emailVerifiedAt,
        kycVerifiedAt: request.kycVerifiedAt,
        bankSetupAt: request.bankSetupAt,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
        reviewNotes: request.reviewNotes,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        payout: request.payout,
      };
    } catch (error) {
      this.logger.error(`Failed to get payout request ${requestId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get Stripe Connect onboarding link
   */
  async getStripeOnboardingLink(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user || !user.creatorProfile) {
        throw new NotFoundException('Creator profile not found');
      }

      if (!user.creatorProfile.stripeAccountId) {
        throw new BadRequestException(
          'Please set up your bank account details first before completing Stripe onboarding',
        );
      }

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

      const accountLink = await this.stripeService.createAccountLink(
        user.creatorProfile.stripeAccountId,
        `${clientUrl}/creator/settings?tab=payout&refresh=true`,
        `${clientUrl}/creator/settings?tab=payout&success=true`,
      );

      this.logger.log(`Stripe onboarding link created for user: ${userId}`);

      return {
        url: accountLink.url,
        expiresAt: new Date(accountLink.expires_at * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to create Stripe onboarding link for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get Stripe account status
   */
  async getStripeAccountStatus(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true },
      });

      if (!user || !user.creatorProfile) {
        throw new NotFoundException('Creator profile not found');
      }

      if (!user.creatorProfile.stripeAccountId) {
        return {
          hasAccount: false,
          onboardingComplete: false,
          chargesEnabled: false,
          payoutsEnabled: false,
        };
      }

      const account = await this.stripeService.getConnectAccount(
        user.creatorProfile.stripeAccountId,
      );

      return {
        hasAccount: true,
        onboardingComplete: account.details_submitted || false,
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        requiresAction: !account.details_submitted,
        accountId: account.id,
      };
    } catch (error) {
      this.logger.error(`Failed to get Stripe account status for user ${userId}:`, error);
      throw error;
    }
  }
}