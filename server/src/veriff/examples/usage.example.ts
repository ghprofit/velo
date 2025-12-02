/**
 * Veriff KYC Integration - Usage Examples
 *
 * This file demonstrates how to use the Veriff module in your application.
 * These are example code snippets - integrate them into your actual services.
 */

import { Injectable, Logger } from '@nestjs/common';
import { VeriffService } from '../veriff.service';
import { CreateSessionDto } from '../dto';

@Injectable()
export class VeriffUsageExample {
  private readonly logger = new Logger(VeriffUsageExample.name);

  constructor(private readonly veriffService: VeriffService) {}

  /**
   * Example 1: Create a verification session for a new user
   */
  async createVerificationSession(userId: string, userDetails: any) {
    try {
      const sessionData: CreateSessionDto = {
        verification: {
          callback: 'https://your-domain.com/veriff/webhooks/decision',
          person: {
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            dateOfBirth: userDetails.dateOfBirth, // Format: YYYY-MM-DD
          },
          vendorData: userId, // Your internal user ID for reference
        },
      };

      const session = await this.veriffService.createSession(sessionData);

      this.logger.log(`Verification session created: ${session.verification.id}`);

      // Return the verification URL to the user
      // They will use this URL to complete the verification process
      return {
        sessionId: session.verification.id,
        verificationUrl: session.verification.url,
        status: session.verification.status,
      };
    } catch (error) {
      this.logger.error('Failed to create verification session:', error);
      throw error;
    }
  }

  /**
   * Example 2: Create session with document information
   */
  async createSessionWithDocumentInfo(userId: string, userDetails: any) {
    try {
      const sessionData: CreateSessionDto = {
        verification: {
          callback: 'https://your-domain.com/veriff/webhooks/decision',
          person: {
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            idNumber: userDetails.idNumber,
          },
          document: {
            number: userDetails.documentNumber,
            type: 'PASSPORT', // or ID_CARD, DRIVERS_LICENSE, etc.
            country: 'US', // ISO 3166-1 alpha-2 country code
          },
          vendorData: JSON.stringify({
            userId: userId,
            email: userDetails.email,
            timestamp: new Date().toISOString(),
          }),
        },
      };

      const session = await this.veriffService.createSession(sessionData);

      return {
        sessionId: session.verification.id,
        verificationUrl: session.verification.url,
      };
    } catch (error) {
      this.logger.error('Failed to create session with document info:', error);
      throw error;
    }
  }

  /**
   * Example 3: Check verification status
   */
  async checkVerificationStatus(sessionId: string) {
    try {
      const status = await this.veriffService.getVerificationStatus(sessionId);

      this.logger.log(`Verification status: ${status.verification.status}`);
      this.logger.log(`Verification code: ${status.verification.code}`);

      // Check the verification result
      if (this.veriffService.isVerificationApproved(status)) {
        this.logger.log('✓ Verification APPROVED');

        // Access verified person data
        const person = status.verification.person;
        const document = status.verification.document;

        return {
          approved: true,
          person: {
            firstName: person?.firstName,
            lastName: person?.lastName,
            dateOfBirth: person?.dateOfBirth,
            nationality: person?.nationality,
            gender: person?.gender,
          },
          document: {
            number: document?.number,
            type: document?.type,
            country: document?.country,
            validFrom: document?.validFrom,
            validUntil: document?.validUntil,
          },
        };
      } else if (this.veriffService.isVerificationDeclined(status)) {
        this.logger.warn(`✗ Verification DECLINED: ${status.verification.reason}`);

        return {
          approved: false,
          reason: status.verification.reason,
          reasonCode: status.verification.reasonCode,
        };
      } else if (this.veriffService.isResubmissionRequired(status)) {
        this.logger.log('↻ Resubmission REQUIRED');

        return {
          resubmissionRequired: true,
          reason: status.verification.reason,
        };
      } else {
        this.logger.log(`Status: ${status.verification.status}`);

        return {
          status: status.verification.status,
          code: status.verification.code,
        };
      }
    } catch (error) {
      this.logger.error('Failed to get verification status:', error);
      throw error;
    }
  }

  /**
   * Example 4: Retrieve session media (images/videos)
   */
  async getSessionMedia(sessionId: string) {
    try {
      const media = await this.veriffService.getSessionMedia(sessionId);

      this.logger.log('Session media retrieved');

      return media;
    } catch (error) {
      this.logger.error('Failed to get session media:', error);
      throw error;
    }
  }

  /**
   * Example 5: Handle resubmission
   */
  async handleResubmission(sessionId: string, updatedData?: any) {
    try {
      // If the user needs to resubmit, you can update the session data
      const updateData: Partial<CreateSessionDto> = {
        verification: {
          person: {
            firstName: updatedData?.firstName,
            lastName: updatedData?.lastName,
          },
        },
      };

      const session = await this.veriffService.resubmitSession(
        sessionId,
        updateData,
      );

      this.logger.log('Session resubmitted successfully');

      return {
        sessionId: session.verification.id,
        verificationUrl: session.verification.url,
      };
    } catch (error) {
      this.logger.error('Failed to resubmit session:', error);
      throw error;
    }
  }

  /**
   * Example 6: Cancel a verification session
   */
  async cancelVerification(sessionId: string) {
    try {
      await this.veriffService.cancelSession(sessionId);

      this.logger.log('Session canceled successfully');

      return {
        canceled: true,
        sessionId: sessionId,
      };
    } catch (error) {
      this.logger.error('Failed to cancel session:', error);
      throw error;
    }
  }

  /**
   * Example 7: Complete user onboarding workflow
   */
  async completeUserOnboarding(userId: string, userDetails: any) {
    try {
      // Step 1: Create verification session
      const session = await this.createVerificationSession(userId, userDetails);

      // TODO: Store session ID in your database
      // await this.userRepository.update(userId, {
      //   veriffSessionId: session.sessionId,
      //   verificationStatus: 'pending',
      // });

      // Step 2: Send verification URL to user
      // await this.emailService.sendVerificationEmail(
      //   userDetails.email,
      //   session.verificationUrl
      // );

      return {
        success: true,
        message: 'Verification session created. Please check your email.',
        verificationUrl: session.verificationUrl,
      };
    } catch (error) {
      this.logger.error('Failed to complete user onboarding:', error);
      throw error;
    }
  }

  /**
   * Example 8: Process webhook decision (called by webhook handler)
   */
  async processWebhookDecision(webhookData: any) {
    try {
      const sessionId = webhookData.verification.id;
      const status = webhookData.verification.status;
      const code = webhookData.verification.code;
      const vendorData = webhookData.verification.vendorData;

      this.logger.log(`Processing webhook for session: ${sessionId}`);

      // Parse vendor data to get your internal user ID
      const userId = vendorData; // or JSON.parse(vendorData).userId

      if (status === 'approved') {
        // Update user status in database
        // await this.userRepository.update(userId, {
        //   verificationStatus: 'approved',
        //   kycCompleted: true,
        //   verifiedAt: new Date(),
        // });

        // Send approval notification
        // await this.notificationService.sendKycApproved(userId);

        this.logger.log(`User ${userId} verification approved`);
      } else if (status === 'declined') {
        // Update user status
        // await this.userRepository.update(userId, {
        //   verificationStatus: 'declined',
        //   kycReason: webhookData.verification.reason,
        // });

        // Send decline notification
        // await this.notificationService.sendKycDeclined(
        //   userId,
        //   webhookData.verification.reason
        // );

        this.logger.log(`User ${userId} verification declined`);
      } else if (code === 9102) {
        // Resubmission required
        // await this.userRepository.update(userId, {
        //   verificationStatus: 'resubmission_required',
        //   kycReason: webhookData.verification.reason,
        // });

        // Send resubmission request notification
        // await this.notificationService.sendKycResubmissionRequired(userId);

        this.logger.log(`User ${userId} needs to resubmit verification`);
      }

      return {
        processed: true,
        sessionId: sessionId,
        status: status,
      };
    } catch (error) {
      this.logger.error('Failed to process webhook decision:', error);
      throw error;
    }
  }
}
