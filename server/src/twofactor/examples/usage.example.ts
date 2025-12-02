/**
 * 2FA Integration Examples
 *
 * This file shows how to integrate the 2FA module into your application
 */

import { Injectable } from '@nestjs/common';
import { TwofactorService } from '../twofactor.service';

@Injectable()
export class TwoFactorExamples {
  constructor(private twofactorService: TwofactorService) {}

  /**
   * Example 1: User Registration with 2FA Setup
   */
  async registerUserWith2FA(userId: string, email: string) {
    // 1. Create user account (your logic)
    // await this.userService.createUser({userId, email});

    // 2. Generate 2FA secret
    const { secret, qrCodeUrl, manualEntryKey } =
      this.twofactorService.generateSecret(userId, email);

    // 3. Return to frontend for QR code display
    return {
      message: 'Account created. Please set up 2FA.',
      qrCodeUrl,        // Display as <img src={qrCodeUrl} />
      manualEntryKey,   // For manual entry
      secret,           // Keep for verification step
    };
  }

  /**
   * Example 2: Complete 2FA Setup
   */
  async complete2FASetup(userId: string, secret: string, token: string) {
    try {
      // Enable 2FA with user's first token
      const result = await this.twofactorService.enable2FA(
        userId,
        secret,
        token,
      );

      // Update user in database
      // await this.userRepository.update(userId, {
      //   twoFactorEnabled: true,
      //   twoFactorSecret: encryptedSecret,
      // });

      return {
        success: true,
        message: '2FA enabled successfully',
        backupCodes: result.backupCodes,
        warning: 'Save these backup codes in a secure location!',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid token. Please try again.',
      };
    }
  }

  /**
   * Example 3: Login with 2FA
   */
  async loginWithUser(
    userId: string,
    password: string,
    twoFactorToken?: string,
  ) {
    // 1. Validate username/password
    // const user = await this.userService.validatePassword(userId, password);
    // if (!user) throw new UnauthorizedException();

    // 2. Check if 2FA is enabled
    const has2FA = this.twofactorService.is2FAEnabled(userId);

    if (has2FA) {
      // 3. If 2FA enabled but no token provided
      if (!twoFactorToken) {
        return {
          requires2FA: true,
          message: 'Please provide your 2FA code',
        };
      }

      // 4. Verify 2FA token
      try {
        const verified = this.twofactorService.verifyToken(
          userId,
          twoFactorToken,
        );

        if (!verified) {
          return {
            success: false,
            message: 'Invalid 2FA code',
          };
        }
      } catch (error) {
        return {
          success: false,
          message: 'Invalid 2FA code',
        };
      }
    }

    // 5. Generate JWT and log user in
    return {
      success: true,
      // accessToken: this.jwtService.sign({ userId }),
      message: 'Login successful',
    };
  }

  /**
   * Example 4: Login with Backup Code
   */
  async loginWithBackupCode(
    userId: string,
    password: string,
    backupCode: string,
  ) {
    // 1. Validate password
    // const user = await this.userService.validatePassword(userId, password);
    // if (!user) throw new UnauthorizedException();

    // 2. Verify backup code
    try {
      const verified = this.twofactorService.verifyBackupCode(
        userId,
        backupCode,
      );

      if (verified) {
        // Backup code is single-use and has been removed
        const remaining = this.twofactorService.getRemainingBackupCodesCount(userId);

        return {
          success: true,
          message: 'Login successful',
          warning: `You have ${remaining} backup codes remaining`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Invalid backup code',
      };
    }
  }

  /**
   * Example 5: Disable 2FA
   */
  async disable2FA(userId: string, password: string, token: string) {
    // 1. Verify password for security
    // const user = await this.userService.validatePassword(userId, password);
    // if (!user) throw new UnauthorizedException();

    // 2. Verify 2FA token
    try {
      const disabled = this.twofactorService.disable2FA(userId, token);

      if (disabled) {
        // Update database
        // await this.userRepository.update(userId, {
        //   twoFactorEnabled: false,
        //   twoFactorSecret: null,
        //   backupCodes: null,
        // });

        return {
          success: true,
          message: '2FA has been disabled for your account',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to disable 2FA',
      };
    }
  }

  /**
   * Example 6: Regenerate Backup Codes
   */
  async regenerateBackupCodes(userId: string, token: string) {
    try {
      const newCodes = this.twofactorService.regenerateBackupCodes(
        userId,
        token,
      );

      return {
        success: true,
        backupCodes: newCodes,
        message: 'New backup codes generated. Previous codes are now invalid.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to regenerate backup codes',
      };
    }
  }

  /**
   * Example 7: Check 2FA Status
   */
  async get2FAStatus(userId: string) {
    const status = this.twofactorService.get2FAStatus(userId);
    const remainingCodes = this.twofactorService.getRemainingBackupCodesCount(userId);

    return {
      enabled: status.enabled,
      hasSecret: status.hasSecret,
      remainingBackupCodes: remainingCodes,
      recommendation: remainingCodes < 3
        ? 'You are running low on backup codes. Consider regenerating them.'
        : null,
    };
  }

  /**
   * Example 8: Account Recovery (Admin Function)
   */
  async adminDisable2FA(adminId: string, targetUserId: string, reason: string) {
    // 1. Verify admin permissions
    // const isAdmin = await this.userService.isAdmin(adminId);
    // if (!isAdmin) throw new ForbiddenException();

    // 2. Log the action
    console.log(`Admin ${adminId} disabling 2FA for user ${targetUserId}. Reason: ${reason}`);

    // 3. Force disable 2FA
    // In production, don't use the regular disable method
    // Instead, directly update the database
    // await this.userRepository.update(targetUserId, {
    //   twoFactorEnabled: false,
    //   twoFactorSecret: null,
    // });

    // 4. Notify user
    // await this.emailService.send({
    //   to: userEmail,
    //   subject: '2FA Disabled by Administrator',
    //   body: 'Your 2FA has been disabled. Please contact support.',
    // });

    return {
      success: true,
      message: '2FA disabled for user',
    };
  }
}
