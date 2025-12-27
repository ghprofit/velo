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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TwofactorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwofactorController = void 0;
const common_1 = require("@nestjs/common");
const twofactor_service_1 = require("./twofactor.service");
const dto_1 = require("./dto");
let TwofactorController = TwofactorController_1 = class TwofactorController {
    constructor(twofactorService) {
        this.twofactorService = twofactorService;
        this.logger = new common_1.Logger(TwofactorController_1.name);
    }
    async setup2FA(setupDto) {
        this.logger.log(`Setting up 2FA for user: ${setupDto.userId}`);
        try {
            const { secret, qrCodeUrl, manualEntryKey } = await this.twofactorService.generateSecret(setupDto.userId);
            const qrCodeDataUrl = await this.twofactorService.generateQRCode(qrCodeUrl);
            return {
                secret,
                qrCodeUrl: qrCodeDataUrl,
                manualEntryKey,
                userId: setupDto.userId,
            };
        }
        catch (error) {
            this.logger.error('Failed to setup 2FA:', error);
            throw error;
        }
    }
    async enable2FA(enableDto) {
        this.logger.log(`Enabling 2FA for user: ${enableDto.userId}`);
        try {
            const result = await this.twofactorService.enable2FA(enableDto.userId, enableDto.secret, enableDto.token);
            return {
                enabled: result.enabled,
                message: '2FA enabled successfully. Save your backup codes in a secure location.',
                backupCodes: result.backupCodes,
            };
        }
        catch (error) {
            this.logger.error('Failed to enable 2FA:', error);
            throw error;
        }
    }
    async verify2FA(verifyDto) {
        this.logger.log(`Verifying 2FA token for user: ${verifyDto.userId}`);
        try {
            const verified = await this.twofactorService.verifyToken(verifyDto.userId, verifyDto.token);
            return {
                verified,
                message: verified ? 'Token verified successfully' : 'Invalid token',
            };
        }
        catch (error) {
            this.logger.error('Failed to verify token:', error);
            throw error;
        }
    }
    async disable2FA(disableDto) {
        this.logger.log(`Disabling 2FA for user: ${disableDto.userId}`);
        try {
            const disabled = await this.twofactorService.disable2FA(disableDto.userId, disableDto.token);
            return {
                disabled,
                message: '2FA disabled successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to disable 2FA:', error);
            throw error;
        }
    }
    get2FAStatus(userId) {
        this.logger.log(`Getting 2FA status for user: ${userId}`);
        const status = this.twofactorService.get2FAStatus(userId);
        const remainingBackupCodes = this.twofactorService.getRemainingBackupCodesCount(userId);
        return {
            ...status,
            remainingBackupCodes,
        };
    }
    async verifyBackupCode(body) {
        this.logger.log(`Verifying backup code for user: ${body.userId}`);
        try {
            const verified = await this.twofactorService.verifyBackupCode(body.userId, body.backupCode);
            return {
                verified,
                message: verified
                    ? 'Backup code verified successfully'
                    : 'Invalid backup code',
            };
        }
        catch (error) {
            this.logger.error('Failed to verify backup code:', error);
            throw error;
        }
    }
    async regenerateBackupCodes(body) {
        this.logger.log(`Regenerating backup codes for user: ${body.userId}`);
        try {
            const backupCodes = await this.twofactorService.regenerateBackupCodes(body.userId, body.token);
            return {
                backupCodes,
                message: 'Backup codes regenerated successfully. Save these in a secure location.',
            };
        }
        catch (error) {
            this.logger.error('Failed to regenerate backup codes:', error);
            throw error;
        }
    }
    generateToken(userId) {
        this.logger.log(`Generating test token for user: ${userId}`);
        try {
            const token = this.twofactorService.generateCurrentToken(userId);
            return {
                userId,
                token,
                message: 'This token is valid for 30 seconds',
                expiresIn: '30 seconds',
            };
        }
        catch (error) {
            this.logger.error('Failed to generate token:', error);
            throw error;
        }
    }
    healthCheck() {
        return {
            status: 'ok',
            service: '2FA Service',
            timestamp: new Date().toISOString(),
        };
    }
    clearAll() {
        this.logger.warn('Clearing all 2FA data');
        this.twofactorService.clearAll();
        return {
            message: 'All 2FA data cleared successfully',
        };
    }
};
exports.TwofactorController = TwofactorController;
__decorate([
    (0, common_1.Post)('setup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.Setup2FADto]),
    __metadata("design:returntype", Promise)
], TwofactorController.prototype, "setup2FA", null);
__decorate([
    (0, common_1.Post)('enable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.Enable2FADto]),
    __metadata("design:returntype", Promise)
], TwofactorController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.Verify2FADto]),
    __metadata("design:returntype", Promise)
], TwofactorController.prototype, "verify2FA", null);
__decorate([
    (0, common_1.Post)('disable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.Disable2FADto]),
    __metadata("design:returntype", Promise)
], TwofactorController.prototype, "disable2FA", null);
__decorate([
    (0, common_1.Get)('status/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TwofactorController.prototype, "get2FAStatus", null);
__decorate([
    (0, common_1.Post)('verify-backup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwofactorController.prototype, "verifyBackupCode", null);
__decorate([
    (0, common_1.Post)('regenerate-backup-codes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwofactorController.prototype, "regenerateBackupCodes", null);
__decorate([
    (0, common_1.Get)('test/generate-token/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TwofactorController.prototype, "generateToken", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwofactorController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('test/clear-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwofactorController.prototype, "clearAll", null);
exports.TwofactorController = TwofactorController = TwofactorController_1 = __decorate([
    (0, common_1.Controller)('2fa'),
    __metadata("design:paramtypes", [twofactor_service_1.TwofactorService])
], TwofactorController);
//# sourceMappingURL=twofactor.controller.js.map