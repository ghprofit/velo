import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import type { TwoFactorSecret, User2FAData, TwoFactorConfig } from './interfaces/two-factor.interface';

@Injectable()
export class TwofactorService {
  private readonly logger = new Logger(TwofactorService.name);
  private readonly config: TwoFactorConfig = {
    appName: 'NestJS App',
    window: 1, // Allow 1 time step before and after current time
    step: 30, // 30 seconds per token
  };

  // In-memory storage for demonstration
  // In production, store this in a database (encrypted!)
  private userSecrets: Map<string, User2FAData> = new Map();

  /**
   * Generate a new 2FA secret for a user
   */
  generateSecret(userId: string, userEmail?: string): {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
  } {
    this.logger.log(`Generating 2FA secret for user: ${userId}`);

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${this.config.appName} (${userEmail || userId})`,
      issuer: this.config.appName,
      length: 32,
    });

    if (!secret.otpauth_url) {
      throw new BadRequestException('Failed to generate OTP auth URL');
    }

    // Store secret (not enabled yet)
    this.userSecrets.set(userId, {
      userId,
      secret: secret.base32,
      enabled: false,
      createdAt: new Date(),
    });

    this.logger.log(`2FA secret generated for user: ${userId}`);

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
  verifyToken(userId: string, token: string): boolean {
    this.logger.log(`Verifying token for user: ${userId}`);

    const userData = this.userSecrets.get(userId);

    if (!userData || !userData.secret) {
      this.logger.error(`No 2FA secret found for user: ${userId}`);
      throw new UnauthorizedException('2FA not set up for this user');
    }

    const verified = speakeasy.totp.verify({
      secret: userData.secret,
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

    // Verify the secret matches what we have
    const userData = this.userSecrets.get(userId);

    if (!userData || userData.secret !== secret) {
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

    // Enable 2FA
    this.userSecrets.set(userId, {
      ...userData,
      enabled: true,
      backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
      enabledAt: new Date(),
    });

    this.logger.log(`2FA enabled successfully for user: ${userId}`);

    return {
      enabled: true,
      backupCodes,
    };
  }

  /**
   * Disable 2FA for a user
   */
  disable2FA(userId: string, token: string): boolean {
    this.logger.log(`Disabling 2FA for user: ${userId}`);

    const userData = this.userSecrets.get(userId);

    if (!userData || !userData.enabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Verify token before disabling
    const verified = this.verifyToken(userId, token);

    if (!verified) {
      throw new UnauthorizedException('Invalid token');
    }

    // Remove 2FA data
    this.userSecrets.delete(userId);

    this.logger.log(`2FA disabled successfully for user: ${userId}`);

    return true;
  }

  /**
   * Check if 2FA is enabled for a user
   */
  is2FAEnabled(userId: string): boolean {
    const userData = this.userSecrets.get(userId);
    return userData?.enabled || false;
  }

  /**
   * Get 2FA status for a user
   */
  get2FAStatus(userId: string): {
    enabled: boolean;
    hasSecret: boolean;
  } {
    const userData = this.userSecrets.get(userId);

    return {
      enabled: userData?.enabled || false,
      hasSecret: !!userData?.secret,
    };
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(userId: string, backupCode: string): boolean {
    this.logger.log(`Verifying backup code for user: ${userId}`);

    const userData = this.userSecrets.get(userId);

    if (!userData || !userData.enabled || !userData.backupCodes) {
      throw new UnauthorizedException('2FA not enabled or no backup codes');
    }

    const hashedCode = this.hashBackupCode(backupCode);
    const codeIndex = userData.backupCodes.indexOf(hashedCode);

    if (codeIndex === -1) {
      this.logger.warn(`Invalid backup code for user: ${userId}`);
      return false;
    }

    // Remove used backup code
    userData.backupCodes.splice(codeIndex, 1);
    this.userSecrets.set(userId, userData);

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
  generateCurrentToken(userId: string): string {
    const userData = this.userSecrets.get(userId);

    if (!userData || !userData.secret) {
      throw new BadRequestException('No 2FA secret found for this user');
    }

    const token = speakeasy.totp({
      secret: userData.secret,
      encoding: 'base32',
      step: this.config.step,
    });

    return token;
  }

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes(userId: string, token: string): string[] {
    this.logger.log(`Regenerating backup codes for user: ${userId}`);

    const userData = this.userSecrets.get(userId);

    if (!userData || !userData.enabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Verify token
    const verified = this.verifyToken(userId, token);

    if (!verified) {
      throw new UnauthorizedException('Invalid token');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(8);

    // Update user data
    this.userSecrets.set(userId, {
      ...userData,
      backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
    });

    this.logger.log(`Backup codes regenerated for user: ${userId}`);

    return backupCodes;
  }

  /**
   * Clear all 2FA data (for testing)
   */
  clearAll(): void {
    this.logger.warn('Clearing all 2FA data');
    this.userSecrets.clear();
  }

  /**
   * Get remaining backup codes count
   */
  getRemainingBackupCodesCount(userId: string): number {
    const userData = this.userSecrets.get(userId);
    return userData?.backupCodes?.length || 0;
  }
}
