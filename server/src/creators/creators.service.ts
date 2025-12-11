import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VeriffService } from '../veriff/veriff.service';
import { CreateSessionDto } from '../veriff/dto';
import { VerificationStatus } from '@prisma/client';
import { SetupBankAccountDto, BankAccountResponseDto } from './dto/bank-account.dto';

@Injectable()
export class CreatorsService {
  private readonly logger = new Logger(CreatorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly veriffService: VeriffService,
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
      const sessionData: CreateSessionDto = {
        verification: {
          callback: `${process.env.APP_URL}/api/veriff/webhooks/decision`,
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

      // TODO: Send notification email to creator
      // await this.emailService.sendVerificationStatusEmail(creatorProfile.userId, verificationStatus);

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

      // Update creator profile with bank account info
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
      };
    } catch (error) {
      this.logger.error(`Failed to get bank account for user ${userId}:`, error);
      throw error;
    }
  }
}
