import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { VerifyBackupCodeDto } from './dto/verify-backup-code.dto';
import { TwofactorService } from '../twofactor/twofactor.service';
export declare class AuthController {
    private readonly authService;
    private readonly twofactorService;
    constructor(authService: AuthService, twofactorService: TwofactorService);
    private setAuthCookies;
    private clearAuthCookies;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    login(dto: LoginDto, req: any, res: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    refresh(dto: RefreshTokenDto, res: any): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    logout(dto: LogoutDto, res: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        data: {
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
                allowBuyerProfileView: boolean;
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
                paypalEmail: string | null;
                stripeAccountId: string | null;
                payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
                policyStrikes: number;
                pendingBalance: number;
                availableBalance: number;
                waitlistBonus: number;
                bonusWithdrawn: boolean;
                userId: string;
            } | null;
        };
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmailCode(dto: VerifyEmailCodeDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    setup2FA(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            secret: string;
            qrCode: string;
            manualEntryKey: string;
        };
    }>;
    enable2FA(req: any, dto: Enable2FADto): Promise<{
        success: boolean;
        message: string;
        data: {
            enabled: boolean;
            backupCodes: string[];
        };
    }>;
    verify2FA(dto: Verify2FADto, res: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    disable2FA(req: any, dto: Disable2FADto): Promise<{
        success: boolean;
        message: string;
        data: {
            disabled: boolean;
        };
    }>;
    get2FAStatus(req: any): Promise<{
        success: boolean;
        data: {
            enabled: boolean;
            hasSecret: boolean;
        };
    }>;
    regenerateBackupCodes(req: any, dto: Disable2FADto): Promise<{
        success: boolean;
        message: string;
        data: {
            backupCodes: string[];
        };
    }>;
    verifyBackupCode(dto: VerifyBackupCodeDto, res: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    listSessions(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            expiresAt: Date;
            deviceName: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            lastUsedAt: Date;
        }[];
    }>;
    revokeSession(req: any, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    revokeAllSessions(req: any, body?: {
        currentSessionId?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProfile(req: any, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    getNotificationPreferences(req: any): Promise<{
        success: boolean;
        data: {
            notifyPayoutUpdates: boolean;
            notifyContentEngagement: boolean;
            notifyPlatformAnnouncements: boolean;
            notifyMarketingEmails: boolean;
        };
    }>;
    updateNotificationPreferences(req: any, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            notifyPayoutUpdates: boolean;
            notifyContentEngagement: boolean;
            notifyPlatformAnnouncements: boolean;
            notifyMarketingEmails: boolean;
        };
    }>;
    deactivateAccount(req: any, dto: {
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteAccount(req: any, dto: {
        password: string;
        confirmation: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map