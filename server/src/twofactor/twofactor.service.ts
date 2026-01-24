import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import type { TwoFactorSecret, User2FAData, TwoFactorConfig } from './interfaces/two-factor.interface';

@Injectable()
export class TwofactorService {
  private readonly logger = new Logger(TwofactorService.name);
  private readonly config: TwoFactorConfig;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.config = {
      appName: this.configService.get('TWO_FACTOR_APP_NAME') || 'VeloLink',
      window: 1, // Allow 1 time step before and after current time
      step: 30, // 30 seconds per token
    };
  }

  /**
   * Helper: Check if user is admin and get appropriate profile
   */
  private async getUserProfile(userId: string): Promise<{
    isAdmin: boolean;
    email: string;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    backupCodes: string[];
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminProfile: {
          select: {
            twoFactorEnabled: true,
            twoFactorSecret: true,
            backupCodes: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If user has adminProfile, use admin 2FA fields
    const isAdmin = !!user.adminProfile;

    return {
      isAdmin,
      email: user.email,
      twoFactorEnabled: isAdmin ? user.adminProfile!.twoFactorEnabled : user.twoFactorEnabled,
      twoFactorSecret: isAdmin ? user.adminProfile!.twoFactorSecret : user.twoFactorSecret,
      backupCodes: isAdmin ? user.adminProfile!.backupCodes : user.backupCodes,
    };
  }

  /**
   * Generate a new 2FA secret for a user
   */
  async generateSecret(userId: string, userEmail?: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
  }> {
    this.logger.log(`Generating 2FA secret for user: ${userId}`);

    // Get user profile
    const profile = await this.getUserProfile(userId);

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${this.config.appName} (${userEmail || profile.email})`,
      issuer: this.config.appName,
      length: 32,
    });

    if (!secret.otpauth_url) {
      throw new BadRequestException('Failed to generate OTP auth URL');
    }

    // Store secret in appropriate table
    if (profile.isAdmin) {
      await this.prisma.adminProfile.update({
        where: { userId },
        data: {
          twoFactorSecret: secret.base32,
          twoFactorEnabled: false,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secret.base32,
          twoFactorEnabled: false,
        },
      });
    }

    this.logger.log(`2FA secret generated for ${profile.isAdmin ? 'admin' : 'user'}: ${userId}`);

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      manualEntryKey: secret.base32,
    };
  }

  /**
   * Generate QR code as data URL
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error('Failed to generate QR code:', error);
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  /**
   * Verify a TOTP token
   */
  async verifyToken(userId: string, token: string): Promise<boolean> {
    this.logger.log(`Verifying token for user: ${userId}`);

    const profile = await this.getUserProfile(userId);

    if (!profile.twoFactorSecret) {
      this.logger.error(`No 2FA secret found for user: ${userId}`);
      throw new UnauthorizedException('2FA not set up for this user');
    }

    const verified = speakeasy.totp.verify({
      secret: profile.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: this.config.window,
      step: this.config.step,
    });

    this.logger.log(`Token verification for user ${userId}: ${verified ? 'SUCCESS' : 'FAILED'}`);

    return verified;
  }

  /**
   * Enable 2FA for a user (after verifying initial token)
   */
  async enable2FA(userId: string, secret: string, token: string): Promise<{
    enabled: boolean;
    backupCodes: string[];
  }> {
    this.logger.log(`Enabling 2FA for user: ${userId}`);

    // Get user profile
    const profile = await this.getUserProfile(userId);

    // Verify the secret matches what we have in database
    if (profile.twoFactorSecret !== secret) {
      throw new BadRequestException('Invalid secret');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: this.config.window,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid token');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(8);

    // Enable 2FA in appropriate table
    if (profile.isAdmin) {
      await this.prisma.adminProfile.update({
        where: { userId },
        data: {
          twoFactorEnabled: true,
          backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
          twoFactorVerifiedAt: new Date(),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
          twoFactorVerifiedAt: new Date(),
        },
      });
    }

    this.logger.log(`2FA enabled successfully for ${profile.isAdmin ? 'admin' : 'user'}: ${userId}`);

    return {
      enabled: true,
      backupCodes,
    };
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: string, token: string): Promise<boolean> {
    this.logger.log(`Disabling 2FA for user: ${userId}`);

    const profile = await this.getUserProfile(userId);

    if (!profile.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Verify token before disabling
    const verified = await this.verifyToken(userId, token);

    if (!verified) {
      throw new UnauthorizedException('Invalid token');
    }

    // Remove 2FA data from appropriate table
    if (profile.isAdmin) {
      await this.prisma.adminProfile.update({
        where: { userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: [],
          twoFactorVerifiedAt: null,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: [],
          twoFactorVerifiedAt: null,
        },
      });
    }

    this.logger.log(`2FA disabled successfully for ${profile.isAdmin ? 'admin' : 'user'}: ${userId}`);

    return true;
  }

  /**
   * Check if 2FA is enabled for a user
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile.twoFactorEnabled;
  }

  /**
   * Get 2FA status for a user
   */
  async get2FAStatus(userId: string): Promise<{
    enabled: boolean;
    hasSecret: boolean;
  }> {
    const profile = await this.getUserProfile(userId);

    return {
      enabled: profile.twoFactorEnabled,
      hasSecret: !!profile.twoFactorSecret,
    };
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    this.logger.log(`Verifying backup code for user: ${userId}`);

    const profile = await this.getUserProfile(userId);

    if (!profile.twoFactorEnabled || !profile.backupCodes || profile.backupCodes.length === 0) {
      throw new UnauthorizedException('2FA not enabled or no backup codes');
    }

    const hashedCode = this.hashBackupCode(backupCode);
    const codeIndex = profile.backupCodes.indexOf(hashedCode);

    if (codeIndex === -1) {
      this.logger.warn(`Invalid backup code for user: ${userId}`);
      return false;
    }

    // Remove used backup code from array
    const updatedBackupCodes = [...profile.backupCodes];
    updatedBackupCodes.splice(codeIndex, 1);

    // Update appropriate table
    if (profile.isAdmin) {
      await this.prisma.adminProfile.update({
        where: { userId },
        data: { backupCodes: updatedBackupCodes },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { backupCodes: updatedBackupCodes },
      });
    }

    this.logger.log(`Backup code verified and removed for user: ${userId}`);

    return true;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Hash backup code for storage
   */
  private hashBackupCode(code: string): string {
    return crypto
      .createHash('sha256')
      .update(code.toLowerCase())
      .digest('hex');
  }

  /**
   * Generate current TOTP token (for testing/debugging)
   */
  async generateCurrentToken(userId: string): Promise<string> {
    const profile = await this.getUserProfile(userId);

    if (!profile.twoFactorSecret) {
      throw new BadRequestException('No 2FA secret found for this user');
    }

    const token = speakeasy.totp({
      secret: profile.twoFactorSecret,
      encoding: 'base32',
      step: this.config.step,
    });

    return token;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, token: string): Promise<string[]> {
    this.logger.log(`Regenerating backup codes for user: ${userId}`);

    const profile = await this.getUserProfile(userId);

    if (!profile.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Verify token
    const verified = await this.verifyToken(userId, token);

    if (!verified) {
      throw new UnauthorizedException('Invalid token');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(8);

    // Update appropriate table with new backup codes
    if (profile.isAdmin) {
      await this.prisma.adminProfile.update({
        where: { userId },
        data: {
          backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
        },
      });
    }

    this.logger.log(`Backup codes regenerated for user: ${userId}`);

    return backupCodes;
  }

  /**
   * Clear all 2FA data (for testing)
   * WARNING: This will disable 2FA for ALL users and admins in the database
   */
  async clearAll(): Promise<void> {
    this.logger.warn('⚠️  DANGER: Clearing all 2FA data from database for ALL users and admins');

    // Clear user 2FA data
    await this.prisma.user.updateMany({
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
        twoFactorVerifiedAt: null,
      },
    });

    // Clear admin 2FA data
    await this.prisma.adminProfile.updateMany({
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
        twoFactorVerifiedAt: null,
      },
    });
  }

  /**
   * Get remaining backup codes count
   */
  async getRemainingBackupCodesCount(userId: string): Promise<number> {
    const profile = await this.getUserProfile(userId);
    return profile.backupCodes?.length || 0;
  }
}
