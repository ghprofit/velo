"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TwofactorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwofactorService = void 0;
const common_1 = require("@nestjs/common");
const speakeasy = __importStar(require("speakeasy"));
const QRCode = __importStar(require("qrcode"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let TwofactorService = TwofactorService_1 = class TwofactorService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(TwofactorService_1.name);
        this.config = {
            appName: this.configService.get('TWO_FACTOR_APP_NAME') || 'VeloLink',
            window: 1,
            step: 30,
        };
    }
    async generateSecret(userId, userEmail) {
        this.logger.log(`Generating 2FA secret for user: ${userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const secret = speakeasy.generateSecret({
            name: `${this.config.appName} (${userEmail || user.email})`,
            issuer: this.config.appName,
            length: 32,
        });
        if (!secret.otpauth_url) {
            throw new common_1.BadRequestException('Failed to generate OTP auth URL');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: secret.base32,
                twoFactorEnabled: false,
            },
        });
        this.logger.log(`2FA secret generated for user: ${userId}`);
        return {
            secret: secret.base32,
            qrCodeUrl: secret.otpauth_url,
            manualEntryKey: secret.base32,
        };
    }
    async generateQRCode(otpauthUrl) {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
            return qrCodeDataUrl;
        }
        catch (error) {
            this.logger.error('Failed to generate QR code:', error);
            throw new common_1.BadRequestException('Failed to generate QR code');
        }
    }
    async verifyToken(userId, token) {
        this.logger.log(`Verifying token for user: ${userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorSecret: true, twoFactorEnabled: true },
        });
        if (!user || !user.twoFactorSecret) {
            this.logger.error(`No 2FA secret found for user: ${userId}`);
            throw new common_1.UnauthorizedException('2FA not set up for this user');
        }
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: this.config.window,
            step: this.config.step,
        });
        this.logger.log(`Token verification for user ${userId}: ${verified ? 'SUCCESS' : 'FAILED'}`);
        return verified;
    }
    async enable2FA(userId, secret, token) {
        this.logger.log(`Enabling 2FA for user: ${userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorSecret: true },
        });
        if (!user || user.twoFactorSecret !== secret) {
            throw new common_1.BadRequestException('Invalid secret');
        }
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: this.config.window,
        });
        if (!verified) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const backupCodes = this.generateBackupCodes(8);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
                twoFactorVerifiedAt: new Date(),
            },
        });
        this.logger.log(`2FA enabled successfully for user: ${userId}`);
        return {
            enabled: true,
            backupCodes,
        };
    }
    async disable2FA(userId, token) {
        this.logger.log(`Disabling 2FA for user: ${userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true },
        });
        if (!user || !user.twoFactorEnabled) {
            throw new common_1.BadRequestException('2FA is not enabled for this user');
        }
        const verified = await this.verifyToken(userId, token);
        if (!verified) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                backupCodes: [],
                twoFactorVerifiedAt: null,
            },
        });
        this.logger.log(`2FA disabled successfully for user: ${userId}`);
        return true;
    }
    async is2FAEnabled(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true },
        });
        return user?.twoFactorEnabled || false;
    }
    async get2FAStatus(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true, twoFactorSecret: true },
        });
        return {
            enabled: user?.twoFactorEnabled || false,
            hasSecret: !!user?.twoFactorSecret,
        };
    }
    async verifyBackupCode(userId, backupCode) {
        this.logger.log(`Verifying backup code for user: ${userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true, backupCodes: true },
        });
        if (!user || !user.twoFactorEnabled || !user.backupCodes || user.backupCodes.length === 0) {
            throw new common_1.UnauthorizedException('2FA not enabled or no backup codes');
        }
        const hashedCode = this.hashBackupCode(backupCode);
        const codeIndex = user.backupCodes.indexOf(hashedCode);
        if (codeIndex === -1) {
            this.logger.warn(`Invalid backup code for user: ${userId}`);
            return false;
        }
        const updatedBackupCodes = [...user.backupCodes];
        updatedBackupCodes.splice(codeIndex, 1);
        await this.prisma.user.update({
            where: { id: userId },
            data: { backupCodes: updatedBackupCodes },
        });
        this.logger.log(`Backup code verified and removed for user: ${userId}`);
        return true;
    }
    generateBackupCodes(count = 8) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        return codes;
    }
    hashBackupCode(code) {
        return crypto
            .createHash('sha256')
            .update(code.toLowerCase())
            .digest('hex');
    }
    async generateCurrentToken(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorSecret: true },
        });
        if (!user || !user.twoFactorSecret) {
            throw new common_1.BadRequestException('No 2FA secret found for this user');
        }
        const token = speakeasy.totp({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            step: this.config.step,
        });
        return token;
    }
    async regenerateBackupCodes(userId, token) {
        this.logger.log(`Regenerating backup codes for user: ${userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { twoFactorEnabled: true },
        });
        if (!user || !user.twoFactorEnabled) {
            throw new common_1.BadRequestException('2FA is not enabled for this user');
        }
        const verified = await this.verifyToken(userId, token);
        if (!verified) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const backupCodes = this.generateBackupCodes(8);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
            },
        });
        this.logger.log(`Backup codes regenerated for user: ${userId}`);
        return backupCodes;
    }
    async clearAll() {
        this.logger.warn('⚠️  DANGER: Clearing all 2FA data from database for ALL users');
        await this.prisma.user.updateMany({
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                backupCodes: [],
                twoFactorVerifiedAt: null,
            },
        });
    }
    async getRemainingBackupCodesCount(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { backupCodes: true },
        });
        return user?.backupCodes?.length || 0;
    }
};
exports.TwofactorService = TwofactorService;
exports.TwofactorService = TwofactorService = TwofactorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], TwofactorService);
//# sourceMappingURL=twofactor.service.js.map