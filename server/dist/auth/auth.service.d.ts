import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TwofactorService } from '../twofactor/twofactor.service';
import { RedisService } from '../redis/redis.service';
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
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    private emailService;
    private twofactorService;
    private redisService;
    private readonly logger;
    private readonly MAX_LOGIN_ATTEMPTS;
    private readonly LOCKOUT_DURATION;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService, emailService: EmailService, twofactorService: TwofactorService, redisService: RedisService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            creatorProfile: {
                id: string | undefined;
                displayName: string | undefined;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus | undefined;
            };
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        requiresTwoFactor: boolean;
        tempToken: string;
        message: string;
        user?: undefined;
        tokens?: undefined;
    } | {
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            creatorProfile: {
                id: string;
                displayName: string;
                profileImage: string | null;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            } | null;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
        requiresTwoFactor?: undefined;
        tempToken?: undefined;
        message?: undefined;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    logout(dto: LogoutDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        displayName: string | undefined;
        firstName: string | null;
        lastName: string | null;
        profilePicture: string | null;
        creatorProfile: {
            totalEarnings: number;
            totalViews: number;
            totalPurchases: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayName: string;
            firstName: string | null;
            lastName: string | null;
            country: string | null;
            bio: string | null;
            profileImage: string | null;
            coverImage: string | null;
            verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            veriffSessionId: string | null;
            veriffDecisionId: string | null;
            verifiedAt: Date | null;
            verificationNotes: string | null;
            dateOfBirth: Date | null;
            bankAccountName: string | null;
            bankName: string | null;
            bankAccountNumber: string | null;
            bankRoutingNumber: string | null;
            bankSwiftCode: string | null;
            bankIban: string | null;
            bankCountry: string | null;
            bankCurrency: string | null;
            payoutSetupCompleted: boolean;
            userId: string;
        } | null;
    }>;
    private hashPassword;
    private generateTokenPair;
    private getRefreshTokenExpiration;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        message: string;
    }>;
    private generateVerificationToken;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    verify2FALogin(dto: Verify2FADto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            creatorProfile: {
                id: string;
                displayName: string;
                profileImage: string | null;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            } | null;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    verifyBackupCodeLogin(dto: VerifyBackupCodeDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            creatorProfile: {
                id: string;
                displayName: string;
                profileImage: string | null;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            } | null;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
        message: string;
    }>;
    private extractDeviceName;
    listSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        expiresAt: Date;
        deviceName: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        lastUsedAt: Date;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        message: string;
    }>;
    revokeAllSessions(userId: string, currentSessionId?: string): Promise<{
        message: string;
    }>;
    updateProfile(userId: string, dto: any): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            createdAt: Date;
            displayName: string | null;
            firstName: string | null;
            lastName: string | null;
            profilePicture: string | null;
        };
    }>;
    getNotificationPreferences(userId: string): Promise<{
        notifyPayoutUpdates: boolean;
        notifyContentEngagement: boolean;
        notifyPlatformAnnouncements: boolean;
        notifyMarketingEmails: boolean;
    }>;
    updateNotificationPreferences(userId: string, dto: any): Promise<{
        notifyPayoutUpdates: boolean;
        notifyContentEngagement: boolean;
        notifyPlatformAnnouncements: boolean;
        notifyMarketingEmails: boolean;
    }>;
    deactivateAccount(userId: string, password: string): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string, password: string, confirmation: string): Promise<{
        message: string;
    }>;
    private isAccountLocked;
    private recordFailedLogin;
    private clearFailedLogins;
}
//# sourceMappingURL=auth.service.d.ts.map