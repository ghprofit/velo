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
   * GET endpoint for user redirect after verification flow
   * Veriff redirects users here after they complete, cancel, or abandon the verification
   *
   * IMPORTANT: Do NOT automatically mark users as verified here!
   * Users can reach this endpoint by:
   * - Completing verification successfully
   * - Canceling verification
   * - Abandoning the flow
   *
   * The actual verification status update should ONLY come from the POST webhook
   * which receives the authentic decision from Veriff with proper signature verification.
   */
  @Get('webhooks/decision')
  @HttpCode(HttpStatus.FOUND)
  async handleUserRedirect(@Res() response: Response, @Req() request: Request): Promise<void> {
    this.logger.log('User redirected from Veriff verification flow');

    const sessionId = request.query.id as string;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    if (sessionId) {
      this.logger.log(`Redirect received for session: ${sessionId}`);

      try {
        // Check if we have a creator profile for this session
        const creatorProfile = await this.prisma.creatorProfile.findUnique({
          where: { veriffSessionId: sessionId },
          select: { id: true, verificationStatus: true },
        });

        if (creatorProfile) {
          this.logger.log(`Creator ${creatorProfile.id} current status: ${creatorProfile.verificationStatus}`);

          // If already verified (webhook processed first), redirect with success
          if (creatorProfile.verificationStatus === VerificationStatus.VERIFIED) {
            response.redirect(`${clientUrl}/creator/verify-identity?verified=true`);
            return;
          }

          // If rejected, redirect with failure
          if (creatorProfile.verificationStatus === VerificationStatus.REJECTED) {
            response.redirect(`${clientUrl}/creator/verify-identity?verified=false&reason=rejected`);
            return;
          }

          // Still pending/in-progress - redirect to check status page
          // The webhook will update the status asynchronously
          response.redirect(`${clientUrl}/creator/verify-identity?status=pending`);
          return;
        } else {
          this.logger.warn(`No creator profile found for session: ${sessionId}`);
        }
      } catch (error) {
        this.logger.error('Error checking verification status:', error);
      }
    } else {
      this.logger.warn('User redirect received without session ID');
    }

    // Default: redirect to verification page with pending status
    // User should wait for webhook to process the actual decision
    response.redirect(`${clientUrl}/creator/verify-identity?status=pending`);
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
    this.logger.log(`Body type: ${typeof request.body}, isBuffer: ${Buffer.isBuffer(request.body)}`);

    try {
      // 1. Handle raw body
      let webhookData: WebhookDecisionDto;
      let rawBody: Buffer;

      // Check if body is already parsed (shouldn't happen but handle it)
      if (typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
        this.logger.warn('Body received as parsed JSON object instead of Buffer');
        webhookData = request.body as WebhookDecisionDto;
        rawBody = Buffer.from(JSON.stringify(webhookData));
      } else if (Buffer.isBuffer(request.body)) {
        rawBody = request.body;
        webhookData = JSON.parse(rawBody.toString('utf-8'));
      } else {
        this.logger.error(`Unexpected body type: ${typeof request.body}`);
        throw new BadRequestException('Invalid request body format');
      }

      this.logger.log(`Webhook data parsed: ${JSON.stringify(webhookData, null, 2)}`);

      // 2. HMAC signature verification (optional in development)
      const signature = request.headers['x-hmac-signature'] as string;

      if (signature) {
        try {
          const isValid = this.veriffService.verifyWebhookSignature(
            rawBody,
            signature,
          );

          if (!isValid) {
            this.logger.error('Invalid webhook signature - REJECTED');
            throw new UnauthorizedException('Invalid webhook signature');
          }

          this.logger.log('Webhook signature verified successfully');
        } catch (signatureError) {
          this.logger.error('Signature verification error:', signatureError);
          if (process.env.NODE_ENV !== 'development') {
            throw signatureError;
          }
          this.logger.warn('DEVELOPMENT MODE: Continuing despite signature verification error');
        }
      } else {
        this.logger.warn('Webhook received without signature');
        if (process.env.NODE_ENV !== 'development') {
          throw new UnauthorizedException('Missing webhook signature');
        }
        this.logger.warn('DEVELOPMENT MODE: Proceeding without signature');
      }

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
      this.logger.log(`Verification reason: ${webhookData.verification.reason || 'N/A'}`);

      const sessionId = webhookData.verification.id;
      const status = webhookData.verification.status;
      const code = webhookData.verification.code;
      const reason = webhookData.verification.reason;

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

        // Handle different verification statuses based on status and code
        if (status === 'approved' && code === 9001) {
          this.logger.log('✅ Verification APPROVED');
          verificationStatus = VerificationStatus.VERIFIED;
          verifiedAt = new Date();
        } else if (status === 'declined' || code === 9103 || code === 9102 || code === 9104) {
          this.logger.log(`❌ Verification DECLINED/REJECTED - Reason: ${reason}`);
          verificationStatus = VerificationStatus.REJECTED;
        } else if (status === 'resubmission_requested' || code === 9121) {
          this.logger.log('⚠️  Verification RESUBMISSION REQUESTED');
          verificationStatus = VerificationStatus.REJECTED;
        } else if (status === 'submitted' || code === 7002) {
          this.logger.log('⏳ Verification still SUBMITTED/IN_PROGRESS - no decision yet');
          // Don't update status - still waiting for final decision
          return;
        } else if (status === 'expired' || code === 9120) {
          this.logger.log('⏱️  Verification session EXPIRED');
          verificationStatus = VerificationStatus.EXPIRED;
        } else {
          this.logger.log(`ℹ️  Unknown status/code combination: ${status}/${code}`);
          // Still mark as processed but don't update status
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
          `✅ Updated verification status for creator ${creatorProfile.id}: ${verificationStatus}`,
        );
        
        // Also log the user ID for easier debugging
        const user = await tx.user.findUnique({
          where: { id: creatorProfile.userId },
          select: { email: true },
        });
        this.logger.log(`User email: ${user?.email}, Final Status: ${verificationStatus}`);
      });

      return { received: true };
    } catch (error) {
      this.logger.error('Failed to process webhook:', error);
      
      // Log full error details for debugging
      if (error instanceof Error) {
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }
      
      // Return 200 OK anyway so Veriff knows we received it
      // This prevents webhook retries for application errors
      // The webhook is already logged in processedWebhook table for manual review
      this.logger.warn('Returning 200 OK despite error - webhook was received, may need manual review');
      
      return { received: true };
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
      webhookUrl: `${process.env.API_URL || process.env.BACKEND_URL}/api/veriff/webhooks/decision`,
      note: 'If any value shows NOT SET, check your .env file',
    };
  }

  /**
   * Debug endpoint to check if webhook was received for a session
   * GET /veriff/debug/webhook/:sessionId
   */
  @Get('debug/webhook/:sessionId')
  @HttpCode(HttpStatus.OK)
  async debugWebhookStatus(@Param('sessionId') sessionId: string): Promise<any> {
    this.logger.log(`Checking webhook status for session: ${sessionId}`);

    const webhook = await this.prisma.processedWebhook.findUnique({
      where: { webhookId: sessionId },
    });

    const creatorProfile = await this.prisma.creatorProfile.findUnique({
      where: { veriffSessionId: sessionId },
      select: {
        id: true,
        verificationStatus: true,
        verifiedAt: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
      sessionId,
      webhookReceived: !!webhook,
      webhookData: webhook
        ? {
            eventType: webhook.eventType,
            processedAt: webhook.createdAt,
          }
        : null,
      creatorProfile: creatorProfile
        ? {
            email: creatorProfile.user.email,
            status: creatorProfile.verificationStatus,
            verifiedAt: creatorProfile.verifiedAt,
          }
        : 'NOT FOUND',
    };
  }
}
