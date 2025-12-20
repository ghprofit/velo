"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorExamples = void 0;
const common_1 = require("@nestjs/common");
const twofactor_service_1 = require("../twofactor.service");
let TwoFactorExamples = class TwoFactorExamples {
    constructor(twofactorService) {
        this.twofactorService = twofactorService;
    }
    async registerUserWith2FA(userId, email) {
        const { secret, qrCodeUrl, manualEntryKey } = this.twofactorService.generateSecret(userId, email);
        return {
            message: 'Account created. Please set up 2FA.',
            qrCodeUrl,
            manualEntryKey,
            secret,
        };
    }
    async complete2FASetup(userId, secret, token) {
        try {
            const result = await this.twofactorService.enable2FA(userId, secret, token);
            return {
                success: true,
                message: '2FA enabled successfully',
                backupCodes: result.backupCodes,
                warning: 'Save these backup codes in a secure location!',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Invalid token. Please try again.',
            };
        }
    }
    async loginWithUser(userId, password, twoFactorToken) {
        const has2FA = this.twofactorService.is2FAEnabled(userId);
        if (has2FA) {
            if (!twoFactorToken) {
                return {
                    requires2FA: true,
                    message: 'Please provide your 2FA code',
                };
            }
            try {
                const verified = this.twofactorService.verifyToken(userId, twoFactorToken);
                if (!verified) {
                    return {
                        success: false,
                        message: 'Invalid 2FA code',
                    };
                }
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Invalid 2FA code',
                };
            }
        }
        return {
            success: true,
            message: 'Login successful',
        };
    }
    async loginWithBackupCode(userId, password, backupCode) {
        try {
            const verified = this.twofactorService.verifyBackupCode(userId, backupCode);
            if (verified) {
                const remaining = this.twofactorService.getRemainingBackupCodesCount(userId);
                return {
                    success: true,
                    message: 'Login successful',
                    warning: `You have ${remaining} backup codes remaining`,
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Invalid backup code',
            };
        }
    }
    async disable2FA(userId, password, token) {
        try {
            const disabled = this.twofactorService.disable2FA(userId, token);
            if (disabled) {
                return {
                    success: true,
                    message: '2FA has been disabled for your account',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to disable 2FA',
            };
        }
    }
    async regenerateBackupCodes(userId, token) {
        try {
            const newCodes = this.twofactorService.regenerateBackupCodes(userId, token);
            return {
                success: true,
                backupCodes: newCodes,
                message: 'New backup codes generated. Previous codes are now invalid.',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to regenerate backup codes',
            };
        }
    }
    async get2FAStatus(userId) {
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
    async adminDisable2FA(adminId, targetUserId, reason) {
        console.log(`Admin ${adminId} disabling 2FA for user ${targetUserId}. Reason: ${reason}`);
        return {
            success: true,
            message: '2FA disabled for user',
        };
    }
};
exports.TwoFactorExamples = TwoFactorExamples;
exports.TwoFactorExamples = TwoFactorExamples = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [twofactor_service_1.TwofactorService])
], TwoFactorExamples);
//# sourceMappingURL=usage.example.js.map