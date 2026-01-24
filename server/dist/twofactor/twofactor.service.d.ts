import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class TwofactorService {
    private prisma;
    private configService;
    private readonly logger;
    private readonly config;
    constructor(prisma: PrismaService, configService: ConfigService);
    private getUserProfile;
    generateSecret(userId: string, userEmail?: string): Promise<{
        secret: string;
        qrCodeUrl: string;
        manualEntryKey: string;
    }>;
    generateQRCode(otpauthUrl: string): Promise<string>;
    verifyToken(userId: string, token: string): Promise<boolean>;
    enable2FA(userId: string, secret: string, token: string): Promise<{
        enabled: boolean;
        backupCodes: string[];
    }>;
    disable2FA(userId: string, token: string): Promise<boolean>;
    is2FAEnabled(userId: string): Promise<boolean>;
    get2FAStatus(userId: string): Promise<{
        enabled: boolean;
        hasSecret: boolean;
    }>;
    verifyBackupCode(userId: string, backupCode: string): Promise<boolean>;
    private generateBackupCodes;
    private hashBackupCode;
    generateCurrentToken(userId: string): Promise<string>;
    regenerateBackupCodes(userId: string, token: string): Promise<string[]>;
    clearAll(): Promise<void>;
    getRemainingBackupCodesCount(userId: string): Promise<number>;
}
//# sourceMappingURL=twofactor.service.d.ts.map