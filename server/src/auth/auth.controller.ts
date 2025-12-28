import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { VerifyBackupCodeDto } from './dto/verify-backup-code.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwofactorService } from '../twofactor/twofactor.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twofactorService: TwofactorService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.login(dto, ipAddress, userAgent);
    return {
      success: true,
      message: result.requiresTwoFactor
        ? result.message
        : 'Login successful.',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refresh(dto);
    return {
      success: true,
      message: 'Token refreshed successfully.',
      data: result,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: LogoutDto) {
    const result = await this.authService.logout(dto);
    return {
      success: true,
      message: result.message,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const result = await this.authService.getProfile(req.user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(dto);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('verify-email-code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async verifyEmailCode(@Req() req: any, @Body() dto: VerifyEmailCodeDto) {
    const result = await this.authService.verifyEmailCode(req.user.id, dto.code);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  async resendVerification(@Body() dto: ResendVerificationDto) {
    const result = await this.authService.resendVerification(dto);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const result = await this.authService.changePassword(req.user.id, dto);
    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== 2FA Endpoints ====================

  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async setup2FA(@Req() req: any) {
    const result = await this.twofactorService.generateSecret(
      req.user.id,
      req.user.email,
    );
    const qrCode = await this.twofactorService.generateQRCode(result.qrCodeUrl);
    return {
      success: true,
      message: '2FA secret generated. Scan the QR code with your authenticator app.',
      data: {
        secret: result.secret,
        qrCode,
        manualEntryKey: result.manualEntryKey,
      },
    };
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  async enable2FA(@Req() req: any, @Body() dto: Enable2FADto) {
    const result = await this.twofactorService.enable2FA(
      req.user.id,
      dto.secret,
      dto.token,
    );
    return {
      success: true,
      message: '2FA enabled successfully. Save your backup codes in a secure location.',
      data: result,
    };
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  async verify2FA(@Body() dto: Verify2FADto) {
    const result = await this.authService.verify2FALogin(dto);
    return {
      success: true,
      message: 'Login successful with 2FA.',
      data: result,
    };
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 attempts per 15 minutes
  async disable2FA(@Req() req: any, @Body() dto: Disable2FADto) {
    const result = await this.twofactorService.disable2FA(
      req.user.id,
      dto.token,
    );
    return {
      success: true,
      message: '2FA disabled successfully.',
      data: { disabled: result },
    };
  }

  @Get('2fa/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async get2FAStatus(@Req() req: any) {
    const status = await this.twofactorService.get2FAStatus(req.user.id);
    return {
      success: true,
      data: status,
    };
  }

  @Post('2fa/backup-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  async regenerateBackupCodes(@Req() req: any, @Body() dto: Disable2FADto) {
    const backupCodes = await this.twofactorService.regenerateBackupCodes(
      req.user.id,
      dto.token,
    );
    return {
      success: true,
      message: 'Backup codes regenerated. Save them in a secure location.',
      data: { backupCodes },
    };
  }

  @Post('2fa/verify-backup')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  async verifyBackupCode(@Body() dto: VerifyBackupCodeDto) {
    const result = await this.authService.verifyBackupCodeLogin(dto);
    return {
      success: true,
      message: result.message || 'Login successful with backup code.',
      data: result,
    };
  }

  // ==================== Session Management Endpoints ====================

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async listSessions(@Req() req: any) {
    const sessions = await this.authService.listSessions(req.user.id);
    return {
      success: true,
      data: sessions,
    };
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Req() req: any, @Param('id') sessionId: string) {
    const result = await this.authService.revokeSession(req.user.id, sessionId);
    return {
      success: true,
      message: result.message,
    };
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async revokeAllSessions(@Req() req: any, @Body() body?: { currentSessionId?: string }) {
    const result = await this.authService.revokeAllSessions(
      req.user.id,
      body?.currentSessionId,
    );
    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== Profile & Settings Endpoints ====================

  @Post('profile/update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: any) {
    const result = await this.authService.updateProfile(req.user.id, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: result,
    };
  }

  @Get('notifications/preferences')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getNotificationPreferences(@Req() req: any) {
    const result = await this.authService.getNotificationPreferences(req.user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Post('notifications/preferences')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateNotificationPreferences(@Req() req: any, @Body() dto: any) {
    const result = await this.authService.updateNotificationPreferences(req.user.id, dto);
    return {
      success: true,
      message: 'Notification preferences updated successfully',
      data: result,
    };
  }

  @Post('account/deactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  async deactivateAccount(@Req() req: any, @Body() dto: { password: string }) {
    const result = await this.authService.deactivateAccount(req.user.id, dto.password);
    return {
      success: true,
      message: result.message,
    };
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  async deleteAccount(@Req() req: any, @Body() dto: { password: string; confirmation: string }) {
    const result = await this.authService.deleteAccount(req.user.id, dto.password, dto.confirmation);
    return {
      success: true,
      message: result.message,
    };
  }
}
