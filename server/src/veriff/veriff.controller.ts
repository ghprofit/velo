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
} from '@nestjs/common';
import { VeriffService } from './veriff.service';
import {
  CreateSessionDto,
  SessionResponseDto,
  VerificationStatusDto,
  WebhookDecisionDto,
} from './dto';

@Controller('veriff')
export class VeriffController {
  private readonly logger = new Logger(VeriffController.name);

  constructor(private readonly veriffService: VeriffService) {}

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
   * Webhook endpoint for Veriff decision callbacks
   * POST /veriff/webhooks/decision
   */
  @Post('webhooks/decision')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() webhookData: WebhookDecisionDto,
    @Headers('x-hmac-signature') signature: string,
  ): Promise<{ received: boolean }> {
    this.logger.log('Received Veriff webhook');

    try {
      // Verify webhook signature if signature is provided
      if (signature) {
        const rawBody = JSON.stringify(webhookData);
        const isValid = this.veriffService.verifyWebhookSignature(
          rawBody,
          signature,
        );

        if (!isValid) {
          this.logger.error('Invalid webhook signature');
          throw new BadRequestException('Invalid webhook signature');
        }
      } else {
        this.logger.warn('Webhook received without signature');
      }

      // Process webhook
      this.logger.log(
        `Webhook received for session: ${webhookData.verification.id}`,
      );
      this.logger.log(`Verification status: ${webhookData.verification.status}`);
      this.logger.log(
        `Verification code: ${webhookData.verification.code}`,
      );

      // Handle different verification statuses
      if (webhookData.verification.status === 'approved') {
        this.logger.log('Verification approved');
        // Add your business logic here (e.g., update database, send notification)
      } else if (webhookData.verification.status === 'declined') {
        this.logger.log(
          `Verification declined: ${webhookData.verification.reason}`,
        );
        // Add your business logic here
      } else if (webhookData.verification.code === 9102) {
        this.logger.log('Verification requires resubmission');
        // Add your business logic here
      }

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
