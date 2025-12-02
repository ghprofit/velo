import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { TwofactorService } from './twofactor.service';
import {
  Setup2FADto,
  Setup2FAResponseDto,
  Verify2FADto,
  Verify2FAResponseDto,
  Enable2FADto,
  Enable2FAResponseDto,
  Disable2FADto,
  Disable2FAResponseDto,
} from './dto';

@Controller('2fa')
export class TwofactorController {
  private readonly logger = new Logger(TwofactorController.name);

  constructor(private readonly twofactorService: TwofactorService) {}

  /**
   * Setup 2FA - Generate secret and QR code
   * POST /2fa/setup
   */
  @Post('setup')
  @HttpCode(HttpStatus.OK)
  async setup2FA(@Body() setupDto: Setup2FADto): Promise<Setup2FAResponseDto> {
    this.logger.log(`Setting up 2FA for user: ${setupDto.userId}`);

    try {
      const { secret, qrCodeUrl, manualEntryKey } =
        this.twofactorService.generateSecret(setupDto.userId);

      // Generate QR code data URL
      const qrCodeDataUrl = await this.twofactorService.generateQRCode(qrCodeUrl);

      return {
        secret,
        qrCodeUrl: qrCodeDataUrl,
        manualEntryKey,
        userId: setupDto.userId,
      };
    } catch (error) {
      this.logger.error('Failed to setup 2FA:', error);
      throw error;
    }
  }

  /**
   * Enable 2FA - Verify token and enable 2FA
   * POST /2fa/enable
   */
  @Post('enable')
  @HttpCode(HttpStatus.OK)
  async enable2FA(@Body() enableDto: Enable2FADto): Promise<Enable2FAResponseDto> {
    this.logger.log(`Enabling 2FA for user: ${enableDto.userId}`);

    try {
      const result = await this.twofactorService.enable2FA(
        enableDto.userId,
        enableDto.secret,
        enableDto.token,
      );

      return {
        enabled: result.enabled,
        message: '2FA enabled successfully. Save your backup codes in a secure location.',
        backupCodes: result.backupCodes,
      };
    } catch (error) {
      this.logger.error('Failed to enable 2FA:', error);
      throw error;
    }
  }

  /**
   * Verify 2FA token
   * POST /2fa/verify
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify2FA(@Body() verifyDto: Verify2FADto): Promise<Verify2FAResponseDto> {
    this.logger.log(`Verifying 2FA token for user: ${verifyDto.userId}`);

    try {
      const verified = this.twofactorService.verifyToken(
        verifyDto.userId,
        verifyDto.token,
      );

      return {
        verified,
        message: verified ? 'Token verified successfully' : 'Invalid token',
      };
    } catch (error) {
      this.logger.error('Failed to verify token:', error);
      throw error;
    }
  }

  /**
   * Disable 2FA
   * POST /2fa/disable
   */
  @Post('disable')
  @HttpCode(HttpStatus.OK)
  async disable2FA(@Body() disableDto: Disable2FADto): Promise<Disable2FAResponseDto> {
    this.logger.log(`Disabling 2FA for user: ${disableDto.userId}`);

    try {
      const disabled = this.twofactorService.disable2FA(
        disableDto.userId,
        disableDto.token,
      );

      return {
        disabled,
        message: '2FA disabled successfully',
      };
    } catch (error) {
      this.logger.error('Failed to disable 2FA:', error);
      throw error;
    }
  }

  /**
   * Get 2FA status
   * GET /2fa/status/:userId
   */
  @Get('status/:userId')
  @HttpCode(HttpStatus.OK)
  get2FAStatus(@Param('userId') userId: string) {
    this.logger.log(`Getting 2FA status for user: ${userId}`);

    const status = this.twofactorService.get2FAStatus(userId);
    const remainingBackupCodes =
      this.twofactorService.getRemainingBackupCodesCount(userId);

    return {
      ...status,
      remainingBackupCodes,
    };
  }

  /**
   * Verify backup code
   * POST /2fa/verify-backup
   */
  @Post('verify-backup')
  @HttpCode(HttpStatus.OK)
  async verifyBackupCode(
    @Body() body: { userId: string; backupCode: string },
  ): Promise<Verify2FAResponseDto> {
    this.logger.log(`Verifying backup code for user: ${body.userId}`);

    try {
      const verified = this.twofactorService.verifyBackupCode(
        body.userId,
        body.backupCode,
      );

      return {
        verified,
        message: verified
          ? 'Backup code verified successfully'
          : 'Invalid backup code',
      };
    } catch (error) {
      this.logger.error('Failed to verify backup code:', error);
      throw error;
    }
  }

  /**
   * Regenerate backup codes
   * POST /2fa/regenerate-backup-codes
   */
  @Post('regenerate-backup-codes')
  @HttpCode(HttpStatus.OK)
  async regenerateBackupCodes(
    @Body() body: { userId: string; token: string },
  ): Promise<{ backupCodes: string[]; message: string }> {
    this.logger.log(`Regenerating backup codes for user: ${body.userId}`);

    try {
      const backupCodes = this.twofactorService.regenerateBackupCodes(
        body.userId,
        body.token,
      );

      return {
        backupCodes,
        message: 'Backup codes regenerated successfully. Save these in a secure location.',
      };
    } catch (error) {
      this.logger.error('Failed to regenerate backup codes:', error);
      throw error;
    }
  }

  /**
   * Generate current token (for testing/debugging only)
   * GET /2fa/test/generate-token/:userId
   */
  @Get('test/generate-token/:userId')
  @HttpCode(HttpStatus.OK)
  generateToken(@Param('userId') userId: string) {
    this.logger.log(`Generating test token for user: ${userId}`);

    try {
      const token = this.twofactorService.generateCurrentToken(userId);

      return {
        userId,
        token,
        message: 'This token is valid for 30 seconds',
        expiresIn: '30 seconds',
      };
    } catch (error) {
      this.logger.error('Failed to generate token:', error);
      throw error;
    }
  }

  /**
   * Health check
   * GET /2fa/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      status: 'ok',
      service: '2FA Service',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear all 2FA data (for testing only - remove in production)
   * POST /2fa/test/clear-all
   */
  @Post('test/clear-all')
  @HttpCode(HttpStatus.OK)
  clearAll() {
    this.logger.warn('Clearing all 2FA data');
    this.twofactorService.clearAll();

    return {
      message: 'All 2FA data cleared successfully',
    };
  }
}
