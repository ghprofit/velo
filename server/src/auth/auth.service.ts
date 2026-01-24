import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TwofactorService } from '../twofactor/twofactor.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { VerifyBackupCodeDto } from './dto/verify-backup-code.dto';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 1800; // 30 minutes in seconds

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
    private twofactorService: TwofactorService,
    private redisService: RedisService,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Check if user was on waitlist
    const waitlistEntry = await this.prisma.waitlist.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    const hasWaitlistBonus = !!waitlistEntry;
    const bonusAmount = hasWaitlistBonus ? 50.0 : 0.0;

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    try {
      // Create user and creator profile in a transaction
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          role: 'CREATOR',
          creatorProfile: {
            create: {
              displayName: dto.displayName,
              firstName: dto.firstName || null,
              lastName: dto.lastName || null,
              country: dto.country || waitlistEntry?.country || null,
              waitlistBonus: bonusAmount,
              totalEarnings: bonusAmount,
              bonusWithdrawn: false,
            },
          },
        },
        include: {
          creatorProfile: true,
        },
      });

      // Generate tokens
      const tokens = this.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token in database
      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt: this.getRefreshTokenExpiration(),
          deviceName: 'Unknown Device', // Could be passed from controller if needed
          lastUsedAt: new Date(),
        },
      });

      // Send verification email
      try {
        await this.generateVerificationToken(user.id, user.email);
      } catch (error) {
        console.error('Failed to generate verification token:', error);
        // Don't fail registration if email fails
      }

      // Send welcome email based on waitlist status
      try {
        if (hasWaitlistBonus) {
          // Send waitlist-specific welcome with bonus information
          await this.emailService.sendWelcomeCreatorWaitlistEmail(
            user.email,
            dto.displayName,
          );
          this.logger.log(`Waitlist welcome email sent to: ${user.email}`);
        } else {
          // Send regular creator welcome
          await this.emailService.sendWelcomeCreatorEmail(
            user.email,
            dto.displayName,
          );
          this.logger.log(`Creator welcome email sent to: ${user.email}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send welcome email:`, error);
        // Don't fail registration if welcome email fails
      }

      // Delete waitlist entry after successful registration
      if (waitlistEntry) {
        await this.prisma.waitlist.delete({
          where: { id: waitlistEntry.id },
        }).catch(() => {
          // Ignore errors - don't fail registration if deletion fails
        });
      }

      // Notify admins about new creator signup
      try {
        await this.notificationsService.notifyAdmins(
          NotificationType.NEW_CREATOR_SIGNUP,
          'New Creator Signed Up',
          `${dto.displayName} (${dto.email}) has registered as a new creator${hasWaitlistBonus ? ' (from waitlist)' : ''}`,
          {
            userId: user.id,
            email: user.email,
            displayName: dto.displayName,
            creatorProfileId: user.creatorProfile?.id,
            hasWaitlistBonus,
          },
        );
        this.logger.log(`Admin notification sent for new creator: ${user.email}`);
      } catch (error) {
        this.logger.error(`Failed to notify admins about new signup:`, error);
        // Don't fail registration if notification fails
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          creatorProfile: {
            id: user.creatorProfile?.id,
            displayName: user.creatorProfile?.displayName,
            verificationStatus: user.creatorProfile?.verificationStatus,
          },
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException(
        'An error occurred during registration. Please try again.',
      );
    }
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const email = dto.email.toLowerCase();
    const loginKey = `login:${email}:${ipAddress || 'unknown'}`;

    // Check if account is locked
    const isLocked = await this.isAccountLocked(loginKey);
    if (isLocked) {
      const ttl = await this.redisService.ttl(loginKey);
      const minutesRemaining = Math.ceil(ttl / 60);
      throw new ForbiddenException(
        `Account temporarily locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.`,
      );
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        creatorProfile: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      await this.recordFailedLogin(loginKey);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      await this.recordFailedLogin(loginKey);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Clear failed login attempts on successful login
    await this.clearFailedLogins(loginKey);

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification (expires in 5 minutes)
      const tempToken = this.jwtService.sign(
        {
          userId: user.id,
          email: user.email,
          purpose: '2fa-pending',
          ipAddress,
          userAgent,
          rememberMe: dto.rememberMe || false,
        },
        {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: '5m',
        },
      );

      return {
        requiresTwoFactor: true,
        tempToken,
        message: 'Please provide your 2FA code to complete login.',
      };
    }

    // Generate tokens
    const tokens = this.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    }, dto.rememberMe);

    // Store refresh token in database with session metadata
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: this.getRefreshTokenExpiration(dto.rememberMe),
        deviceName: this.extractDeviceName(userAgent),
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        lastUsedAt: new Date(),
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        creatorProfile: user.creatorProfile,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    // Verify refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Verify JWT
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Generate new token pair
      const tokens = this.generateTokenPair({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      // Update refresh token in database
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          token: tokens.refreshToken,
          expiresAt: this.getRefreshTokenExpiration(),
          lastUsedAt: new Date(),
        },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(dto: LogoutDto) {
    // Delete refresh token from database
    await this.prisma.refreshToken.deleteMany({
      where: { token: dto.refreshToken },
    });

    return { message: 'Logged out successfully.' };
  }

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          creatorProfile: true,
          adminProfile: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      // Compute real stats if user has a creator profile
      let computedStats = {
        totalEarnings: 0,
        totalViews: 0,
        totalPurchases: 0,
      };

      if (user.creatorProfile) {
        try {
          // Get all completed purchases for this creator's content
          const purchases = await this.prisma.purchase.findMany({
            where: {
              content: {
                creatorId: user.creatorProfile.id,
              },
              status: 'COMPLETED',
            },
            select: {
              amount: true,
            },
          });

          // Get all content for this creator to sum views
          const contents = await this.prisma.content.findMany({
            where: {
              creatorId: user.creatorProfile.id,
            },
            select: {
              viewCount: true,
              purchaseCount: true,
            },
          });

          computedStats.totalEarnings = purchases.reduce(
            (sum, p) => sum + p.amount,
            0,
          );
          computedStats.totalPurchases = purchases.length;
          computedStats.totalViews = contents.reduce(
            (sum, c) => sum + c.viewCount,
            0,
          );
        } catch (statsError) {
          this.logger.error(
            `Error computing creator stats for user ${userId}:`,
            statsError,
          );
          // Continue with default stats if computation fails
        }
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        displayName: user.displayName || user.creatorProfile?.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        adminRole: user.adminProfile?.adminRole || null,
        creatorProfile: user.creatorProfile
          ? {
              ...user.creatorProfile,
              // Override with computed real-time stats
              totalEarnings: computedStats.totalEarnings,
              totalViews: computedStats.totalViews,
              totalPurchases: computedStats.totalPurchases,
            }
          : null,
      };
    } catch (error) {
      this.logger.error(`Error in getProfile for user ${userId}:`, error);
      throw new InternalServerErrorException(
        'Failed to fetch user profile. Please try again later.',
      );
    }
  }

  // Helper methods
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  private generateTokenPair(payload: JWTPayload, rememberMe = false): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
    });

    // Extended expiry for rememberMe: 30 days, otherwise 7 days
    const refreshExpiry = rememberMe ? '30d' : '7d';

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiry,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private getRefreshTokenExpiration(rememberMe = false): Date {
    // Extended expiry for rememberMe: 30 days, otherwise 7 days
    const expirationTime = rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      : 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    return new Date(Date.now() + expirationTime);
  }

  // Email Verification Methods
  async verifyEmail(dto: VerifyEmailDto) {
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new BadRequestException('Verification token has expired. Please request a new one.');
    }

    // Update user as verified
    const updatedUser = await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
      include: {
        creatorProfile: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            verificationStatus: true,
          },
        },
      },
    });

    // Delete used token
    await this.prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Return success message with updated user data
    return {
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        creatorProfile: updatedUser.creatorProfile,
      },
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Delete any existing verification tokens for this user
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new verification token
    await this.generateVerificationToken(user.id, user.email);

    return {
      message: 'Verification email sent successfully',
    };
  }

  private async generateVerificationToken(userId: string, email: string) {
    // Generate 6-digit numeric code (100000-999999)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiration (20 minutes for security)
    const expiryMinutes = 20;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Delete any existing verification tokens for this user
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Store code in database
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        token: code, // Store 6-digit code in token field
        expiresAt,
      },
    });

    // Send verification email with CODE (not link)
    try {
      await this.emailService.sendEmailVerification(
        email,
        email.split('@')[0] || 'User', // Use email username as fallback name
        code, // Pass code instead of link
        expiryMinutes, // Pass minutes instead of hours
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error - token is still created
    }

    return code;
  }

  // Password Reset Methods
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Delete any existing reset tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration (1 hour from now)
    const expirySeconds = parseInt(this.config.get('PASSWORD_RESET_TOKEN_EXPIRY') || '3600');
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    // Store token in database
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send password reset email
    const resetLink = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;

    try {
      await this.emailService.sendPasswordReset(
        user.email,
        user.email.split('@')[0] || 'User',
        resetLink,
        expirySeconds / 60, // Convert to minutes
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(dto.newPassword);

    // Update user password
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Invalidate all refresh tokens for this user (force re-login)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return {
      message: 'Password reset successfully. Please login with your new password.',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(dto.newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens except current session (optional)
    // For now, we'll keep all sessions active

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Verify 2FA TOTP code and complete login
   */
  async verify2FALogin(dto: Verify2FADto) {
    // Verify the temp token
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.tempToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      if (payload.purpose !== '2fa-pending') {
        throw new UnauthorizedException('Invalid token purpose');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    // Verify the 2FA code
    const verified = await this.twofactorService.verifyToken(
      payload.userId,
      dto.token,
    );

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        creatorProfile: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate tokens (preserve rememberMe preference from login)
    const rememberMe = payload.rememberMe || false;
    const tokens = this.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    }, rememberMe);

    // Store refresh token in database with session metadata
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: this.getRefreshTokenExpiration(rememberMe),
        deviceName: this.extractDeviceName(payload.userAgent),
        ipAddress: payload.ipAddress || null,
        userAgent: payload.userAgent || null,
        lastUsedAt: new Date(),
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        creatorProfile: user.creatorProfile,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    };
  }

  /**
   * Verify backup code and complete login
   */
  async verifyBackupCodeLogin(dto: VerifyBackupCodeDto) {
    // Verify the temp token
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.tempToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      if (payload.purpose !== '2fa-pending') {
        throw new UnauthorizedException('Invalid token purpose');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    // Verify the backup code
    const verified = await this.twofactorService.verifyBackupCode(
      payload.userId,
      dto.backupCode,
    );

    if (!verified) {
      throw new UnauthorizedException('Invalid backup code');
    }

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        creatorProfile: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate tokens (preserve rememberMe preference from login)
    const rememberMe = payload.rememberMe || false;
    const tokens = this.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    }, rememberMe);

    // Store refresh token in database with session metadata
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: this.getRefreshTokenExpiration(rememberMe),
        deviceName: this.extractDeviceName(payload.userAgent),
        ipAddress: payload.ipAddress || null,
        userAgent: payload.userAgent || null,
        lastUsedAt: new Date(),
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Get remaining backup codes count
    const remainingCodes = await this.twofactorService.getRemainingBackupCodesCount(
      user.id,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        creatorProfile: user.creatorProfile,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      message: `Backup code verified. You have ${remainingCodes} backup codes remaining.`,
    };
  }

  /**
   * Extract device name from user agent
   */
  private extractDeviceName(userAgent: string | undefined): string {
    if (!userAgent) return 'Unknown Device';

    // Simple device detection
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Macintosh')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';

    return 'Unknown Device';
  }

  /**
   * List active sessions for a user
   */
  async listSessions(userId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceName: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    return sessions;
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.refreshToken.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.refreshToken.delete({
      where: { id: sessionId },
    });

    return {
      message: 'Session revoked successfully',
    };
  }

  /**
   * Revoke all sessions except the current one
   */
  async revokeAllSessions(userId: string, currentSessionId?: string) {
    if (currentSessionId) {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
          id: { not: currentSessionId },
        },
      });

      return {
        message: 'All other sessions have been revoked',
      };
    }

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return {
      message: 'All sessions have been revoked',
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and is already taken
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email ? dto.email.toLowerCase() : undefined,
        displayName: dto.displayName,
        firstName: dto.firstName,
        lastName: dto.lastName,
        profilePicture: dto.profilePicture,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        emailVerified: true,
        role: true,
        createdAt: true,
      },
    });

    return { user: updatedUser };
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        notifyPayoutUpdates: true,
        notifyContentEngagement: true,
        notifyPlatformAnnouncements: true,
        notifyMarketingEmails: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId: string, dto: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        notifyPayoutUpdates: dto.payoutUpdates,
        notifyContentEngagement: dto.contentEngagement,
        notifyPlatformAnnouncements: dto.platformAnnouncements,
        notifyMarketingEmails: dto.marketingEmails,
      },
      select: {
        notifyPayoutUpdates: true,
        notifyContentEngagement: true,
        notifyPlatformAnnouncements: true,
        notifyMarketingEmails: true,
      },
    });

    return user;
  }

  /**
   * Deactivate account (soft delete)
   */
  async deactivateAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Deactivate user
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Revoke all sessions
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Account deactivated successfully' };
  }

  /**
   * Delete account permanently
   */
  async deleteAccount(userId: string, password: string, confirmation: string) {
    // Verify confirmation string
    if (confirmation !== 'DELETE MY ACCOUNT') {
      throw new BadRequestException('Invalid confirmation string');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Check if there are pending payouts
    if (user.creatorProfile && user.creatorProfile.totalEarnings > 0) {
      throw new BadRequestException(
        'Cannot delete account with pending earnings. Please withdraw all funds first.',
      );
    }

    // Delete user and all related data (cascade)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.log(`Account deleted permanently: ${user.email}`);

    return { message: 'Account deleted permanently' };
  }

  /**
   * Check if account is locked due to failed login attempts
   */
  private async isAccountLocked(loginKey: string): Promise<boolean> {
    const attempts = await this.redisService.get(loginKey);
    return attempts !== null && parseInt(attempts) >= this.MAX_LOGIN_ATTEMPTS;
  }

  /**
   * Record a failed login attempt
   */
  private async recordFailedLogin(loginKey: string): Promise<void> {
    const attempts = await this.redisService.incr(loginKey);

    // Set TTL on first failed attempt
    if (attempts === 1) {
      await this.redisService.expire(loginKey, this.LOCKOUT_DURATION);
    }

    // Log warning if account is now locked
    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      this.logger.warn(`Account locked: ${loginKey} after ${attempts} failed attempts`);
    }
  }

  /**
   * Clear failed login attempts
   */
  private async clearFailedLogins(loginKey: string): Promise<void> {
    await this.redisService.del(loginKey);
  }
}
