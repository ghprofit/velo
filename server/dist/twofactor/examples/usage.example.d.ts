import { TwofactorService } from '../twofactor.service';
export declare class TwoFactorExamples {
    private twofactorService;
    constructor(twofactorService: TwofactorService);
    registerUserWith2FA(userId: string, email: string): Promise<{
        message: string;
        qrCodeUrl: any;
        manualEntryKey: any;
        secret: any;
    }>;
    complete2FASetup(userId: string, secret: string, token: string): Promise<{
        success: boolean;
        message: string;
        backupCodes: string[];
        warning: string;
    } | {
        success: boolean;
        message: string;
        backupCodes?: undefined;
        warning?: undefined;
    }>;
    loginWithUser(userId: string, password: string, twoFactorToken?: string): Promise<{
        requires2FA: boolean;
        message: string;
        success?: undefined;
    } | {
        success: boolean;
        message: string;
        requires2FA?: undefined;
    }>;
    loginWithBackupCode(userId: string, password: string, backupCode: string): Promise<{
        success: boolean;
        message: string;
        warning: string;
    } | {
        success: boolean;
        message: string;
        warning?: undefined;
    } | undefined>;
    disable2FA(userId: string, password: string, token: string): Promise<{
        success: boolean;
        message: string;
    } | undefined>;
    regenerateBackupCodes(userId: string, token: string): Promise<{
        success: boolean;
        backupCodes: Promise<string[]>;
        message: string;
    } | {
        success: boolean;
        message: string;
        backupCodes?: undefined;
    }>;
    get2FAStatus(userId: string): Promise<{
        enabled: any;
        hasSecret: any;
        remainingBackupCodes: Promise<number>;
        recommendation: string | null;
    }>;
    adminDisable2FA(adminId: string, targetUserId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=usage.example.d.ts.map