import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import { EmailService } from './email.service';
import {
  SendEmailDto,
  SendEmailResponseDto,
  SendTemplateEmailDto,
  SendBulkEmailDto,
  SendBulkEmailResponseDto,
} from './dto';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Send a single email
   * POST /email/send
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<SendEmailResponseDto> {
    this.logger.log(`Sending email to: ${sendEmailDto.to}`);

    const result = await this.emailService.sendEmail({
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      text: sendEmailDto.text,
      html: sendEmailDto.html,
      from: sendEmailDto.from,
      fromName: sendEmailDto.fromName,
      replyTo: sendEmailDto.replyTo,
      cc: sendEmailDto.cc,
      bcc: sendEmailDto.bcc,
      attachments: sendEmailDto.attachments,
      customArgs: sendEmailDto.customArgs,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      message: result.success ? 'Email sent successfully' : result.error || 'Failed to send email',
      timestamp: new Date(),
    };
  }

  /**
   * Send email using SendGrid template
   * POST /email/send-template
   */
  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  async sendTemplateEmail(@Body() dto: SendTemplateEmailDto): Promise<SendEmailResponseDto> {
    this.logger.log(`Sending template email to: ${dto.to}`);

    const result = await this.emailService.sendEmail({
      to: dto.to,
      subject: '', // Subject comes from template
      templateId: dto.templateId,
      templateData: dto.templateData,
      from: dto.from,
      fromName: dto.fromName,
      replyTo: dto.replyTo,
      cc: dto.cc,
      bcc: dto.bcc,
      customArgs: dto.customArgs,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      message: result.success ? 'Template email sent successfully' : result.error || 'Failed to send email',
      timestamp: new Date(),
    };
  }

  /**
   * Send bulk emails
   * POST /email/send-bulk
   */
  @Post('send-bulk')
  @HttpCode(HttpStatus.OK)
  async sendBulkEmail(@Body() dto: SendBulkEmailDto): Promise<SendBulkEmailResponseDto> {
    this.logger.log(`Sending bulk email to ${dto.recipients.length} recipients`);

    const result = await this.emailService.sendBulkEmails(
      dto.recipients,
      {
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
        templateId: dto.templateId,
        templateData: dto.commonTemplateData,
        from: dto.from,
        fromName: dto.fromName,
        replyTo: dto.replyTo,
        customArgs: dto.customArgs,
      },
    );

    return {
      success: result.failureCount === 0,
      totalRecipients: result.totalRecipients,
      successCount: result.successCount,
      failureCount: result.failureCount,
      failures: result.failures,
      message: `Bulk email completed. ${result.successCount}/${result.totalRecipients} sent successfully`,
      timestamp: new Date(),
    };
  }

  /**
   * Send welcome email
   * POST /email/welcome
   */
  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  async sendWelcomeEmail(
    @Body() body: { email: string; userName: string },
  ): Promise<SendEmailResponseDto> {
    this.logger.log(`Sending welcome email to: ${body.email}`);

    const result = await this.emailService.sendWelcomeEmail(
      body.email,
      body.userName,
    );

    return {
      success: result.success,
      messageId: result.messageId,
      message: result.success ? 'Welcome email sent' : result.error || 'Failed',
      timestamp: new Date(),
    };
  }

  /**
   * Send email verification
   * POST /email/verify
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async sendEmailVerification(
    @Body() body: { email: string; userName: string; verificationLink: string },
  ): Promise<SendEmailResponseDto> {
    this.logger.log(`Sending verification email to: ${body.email}`);

    const result = await this.emailService.sendEmailVerification(
      body.email,
      body.userName,
      body.verificationLink,
    );

    return {
      success: result.success,
      messageId: result.messageId,
      message: result.success ? 'Verification email sent' : result.error || 'Failed',
      timestamp: new Date(),
    };
  }

  /**
   * Send password reset
   * POST /email/password-reset
   */
  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  async sendPasswordReset(
    @Body() body: { email: string; userName: string; resetLink: string },
  ): Promise<SendEmailResponseDto> {
    this.logger.log(`Sending password reset email to: ${body.email}`);

    const result = await this.emailService.sendPasswordReset(
      body.email,
      body.userName,
      body.resetLink,
    );

    return {
      success: result.success,
      messageId: result.messageId,
      message: result.success ? 'Password reset email sent' : result.error || 'Failed',
      timestamp: new Date(),
    };
  }

  /**
   * Test email configuration
   * POST /email/test
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testEmail(@Body() body: { email: string }): Promise<SendEmailResponseDto> {
    this.logger.log(`Testing email configuration with: ${body.email}`);

    const result = await this.emailService.testConfiguration(body.email);

    return {
      success: result.success,
      messageId: result.messageId,
      message: result.success ? 'Test email sent successfully' : result.error || 'Failed',
      timestamp: new Date(),
    };
  }

  /**
   * Get email stats
   * GET /email/stats/:days
   */
  @Get('stats/:days')
  @HttpCode(HttpStatus.OK)
  async getStats(@Param('days') days: string) {
    return this.emailService.getEmailStats(parseInt(days) || 7);
  }

  /**
   * Health check
   * GET /email/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      status: 'ok',
      service: 'Email Service',
      provider: 'SendGrid',
      timestamp: new Date().toISOString(),
    };
  }
}
