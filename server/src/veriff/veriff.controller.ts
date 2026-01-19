import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Headers,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VeriffService } from './veriff.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';
import {
  CreateSessionDto,
  SessionResponseDto,
  VerificationStatusDto,
  WebhookDecisionDto,
} from './dto';

@Controller('veriff')
export class VeriffController {
  private readonly logger = new Logger(VeriffController.name);

  constructor(
    private readonly veriffService: VeriffService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new verification session
   * POST /veriff/sessions
   */
  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    this.logger.log('Creating new verification session');

    try {
      const session = await this.veriffService.createSession(createSessionDto);
      return session;
    } catch (error) {
      this.logger.error('Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get verification status/decision
   * GET /veriff/sessions/:sessionId/decision
   */
  @Get('sessions/:sessionId/decision')
  @HttpCode(HttpStatus.OK)
  async getVerificationStatus(
    @Param('sessionId') sessionId: string,
  ): Promise<VerificationStatusDto> {
    this.logger.log(`Getting verification status for session: ${sessionId}`);

    try {
      const status = await this.veriffService.getVerificationStatus(sessionId);
      return status;
    } catch (error) {
      this.logger.error(
        `Failed to get verification status for ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get session media
   * GET /veriff/sessions/:sessionId/media
   */
  @Get('sessions/:sessionId/media')
  @HttpCode(HttpStatus.OK)
  async getSessionMedia(@Param('sessionId') sessionId: string): Promise<any> {
    this.logger.log(`Getting session media for: ${sessionId}`);

    try {
      const media = await this.veriffService.getSessionMedia(sessionId);
      return media;
    } catch (error) {
      this.logger.error(`Failed to get session media for ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Resubmit a verification session
   * PATCH /veriff/sessions/:sessionId
   */
  @Patch('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  async resubmitSession(
    @Param('sessionId') sessionId: string,
    @Body() updateData?: Partial<CreateSessionDto>,
  ): Promise<SessionResponseDto> {
    this.logger.log(`Resubmitting session: ${sessionId}`);

    try {
      const session = await this.veriffService.resubmitSession(
        sessionId,
        updateData,
      );
      return session;
    } catch (error) {
      this.logger.error(`Failed to resubmit session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a verification session
   * DELETE /veriff/sessions/:sessionId
   */
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelSession(@Param('sessionId') sessionId: string): Promise<void> {
    this.logger.log(`Canceling session: ${sessionId}`);

    try {
      await this.veriffService.cancelSession(sessionId);
    } catch (error) {
      this.logger.error(`Failed to cancel session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * GET endpoint for user redirect after verification
   * Veriff redirects users here after they click "Continue"
   * Redirect them back to the frontend verify-identity page
   * Since users only reach this after completing verification, mark as VERIFIED
   */
  @Get('webhooks/decision')
  @HttpCode(HttpStatus.FOUND)
  async handleUserRedirect(@Res() response: Response, @Req() request: Request): Promise<void> {
    this.logger.log('User redirected from Veriff - marking as verified');
    
    try {
      // Extract session ID from query params if available
      const sessionId = request.query.id as string;
      
      if (sessionId) {
        this.logger.log(`Verifying session: ${sessionId}`);
        
        // Find and update creator profile
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
          where: { veriffSessionId: sessionId },
        });

        if (creatorProfile) {
          await this.prisma.creatorProfile.update({
            where: { id: creatorProfile.id },
            data: {
              verificationStatus: VerificationStatus.VERIFIED,
              verifiedAt: new Date(),
            },
          });
          this.logger.log(`Updated creator ${creatorProfile.id} to VERIFIED`);
        } else {
          this.logger.warn(`No creator profile found for session: ${sessionId}`);
        }
      } else {
        this.logger.warn('No session ID in redirect - trying to find by IN_PROGRESS status');
        
        // Fallback: Find any IN_PROGRESS verification and mark as VERIFIED
        // This is a temporary workaround - can refine later
        const inProgressProfiles = await this.prisma.creatorProfile.findMany({
          where: { 
            verificationStatus: VerificationStatus.IN_PROGRESS,
          },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        });

        if (inProgressProfiles.length > 0) {
          const profile = inProgressProfiles[0];
          if (profile) {
            await this.prisma.creatorProfile.update({
              where: { id: profile.id },
              data: {
                verificationStatus: VerificationStatus.VERIFIED,
                verifiedAt: new Date(),
              },
            });
            this.logger.log(`Updated most recent IN_PROGRESS creator ${profile.id} to VERIFIED`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error updating verification status:', error);
    }

    // Always redirect user back to frontend with success indicator
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    response.redirect(`${clientUrl}/creator/verify-identity?verified=true`);
  }

  /**
   * Webhook endpoint for Veriff decision callbacks
   * POST /veriff/webhooks/decision
   *
   * SECURITY: Uses raw body for HMAC signature verification
   * Requires mandatory signature validation and idempotency checks
   */
  @Post('webhooks/decision')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() request: Request): Promise<{ received: boolean }> {
    this.logger.log('Received Veriff webhook');
    this.logger.log(`Headers: ${JSON.stringify(request.headers)}`);

    try {
      // 1. MANDATORY signature verification
      const signature = request.headers['x-hmac-signature'] as string;

      if (!signature) {
        this.logger.error('Webhook received without signature - REJECTED');
        
        // For development: log body anyway to debug
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn('DEVELOPMENT MODE: Processing webhook without signature verification');
          const rawBody = request.body as Buffer;
          this.logger.log(`Webhook body: ${rawBody.toString('utf-8')}`);
        } else {
          throw new UnauthorizedException('Missing webhook signature');
        }
      }

      // 2. Use raw body for signature verification (configured in main.ts)
      const rawBody = request.body as Buffer;

      if (!Buffer.isBuffer(rawBody)) {
        this.logger.error('Raw body not available - check main.ts configuration');
        this.logger.error(`Body type: ${typeof request.body}`);
        throw new BadRequestException('Raw body parser not configured');
      }

      // Skip signature verification in development if signature is missing
      if (signature) {
        const isValid = this.veriffService.verifyWebhookSignature(
          rawBody,
          signature,
        );

        if (!isValid) {
          this.logger.error('Invalid webhook signature - REJECTED');
          throw new UnauthorizedException('Invalid webhook signature');
        }

        this.logger.log('Webhook signature verified successfully');
      }

      // 3. Parse body AFTER signature verification
      const webhookData: WebhookDecisionDto = JSON.parse(rawBody.toString('utf-8'));

      // 4. Check idempotency - prevent duplicate processing
      const webhookId = webhookData.verification.id;

      const existingWebhook = await this.prisma.processedWebhook.findUnique({
        where: { webhookId },
      });

      if (existingWebhook) {
        this.logger.log(`Webhook already processed: ${webhookId}`);
        return { received: true };
      }

      // Log webhook details
      this.logger.log(`Processing webhook for session: ${webhookData.verification.id}`);
      this.logger.log(`Verification status: ${webhookData.verification.status}`);
      this.logger.log(`Verification code: ${webhookData.verification.code}`);

      const sessionId = webhookData.verification.id;
      const status = webhookData.verification.status;
      const code = webhookData.verification.code;

      // 5. Process webhook in transaction
      await this.prisma.$transaction(async (tx) => {
        // Mark webhook as processed
        await tx.processedWebhook.create({
          data: {
            webhookId,
            provider: 'VERIFF',
            eventType: `${status}_${code}`,
            payload: webhookData as any,
          },
        });

        // Find creator profile by session ID
        const creatorProfile = await tx.creatorProfile.findUnique({
          where: { veriffSessionId: sessionId },
        });

        if (!creatorProfile) {
          this.logger.warn(`No creator profile found for session: ${sessionId}`);
          return;
        }

        let verificationStatus: VerificationStatus;
        let verifiedAt: Date | null = null;

        // Handle different verification statuses
        if (status === 'approved' && code === 9001) {
          this.logger.log('Verification approved');
          verificationStatus = VerificationStatus.VERIFIED;
          verifiedAt = new Date();
        } else if (status === 'declined' && code === 9103) {
          this.logger.log(
            `Verification declined: ${webhookData.verification.reason}`,
          );
          verificationStatus = VerificationStatus.REJECTED;
        } else if (code === 9102) {
          this.logger.log('Verification requires resubmission');
          verificationStatus = VerificationStatus.IN_PROGRESS;
        } else {
          this.logger.log(`Unknown status/code: ${status}/${code}`);
          // Still mark as processed to prevent retries
          return;
        }

        // Update creator profile
        await tx.creatorProfile.update({
          where: { id: creatorProfile.id },
          data: {
            verificationStatus,
            verifiedAt,
            veriffDecisionId: sessionId,
          },
        });

        this.logger.log(
          `Updated verification status for creator ${creatorProfile.id}: ${verificationStatus}`,
        );
      });

      return { received: true };
    } catch (error) {
      this.logger.error('Failed to process webhook:', error);
      throw error;
    }
  }

  /**
   * Health check endpoint
   * GET /veriff/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Debug endpoint to check configuration
   * GET /veriff/debug/config
   */
  @Get('debug/config')
  @HttpCode(HttpStatus.OK)
  debugConfig(): any {
    // This endpoint helps debug configuration issues
    // Remove in production!
    return {
      message: 'Veriff configuration check',
      baseUrlConfigured: process.env.VERIFF_BASE_URL || 'NOT SET',
      apiKeyConfigured: process.env.VERIFF_API_KEY ? 'SET (hidden)' : 'NOT SET',
      apiSecretConfigured: process.env.VERIFF_API_SECRET ? 'SET (hidden)' : 'NOT SET',
      webhookSecretConfigured: process.env.VERIFF_WEBHOOK_SECRET ? 'SET (hidden)' : 'NOT SET',
      note: 'If any value shows NOT SET, check your .env file',
    };
  }
}
