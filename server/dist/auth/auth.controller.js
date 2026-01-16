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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const logout_dto_1 = require("./dto/logout.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const verify_email_code_dto_1 = require("./dto/verify-email-code.dto");
const resend_verification_dto_1 = require("./dto/resend-verification.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const enable_2fa_dto_1 = require("./dto/enable-2fa.dto");
const verify_2fa_dto_1 = require("./dto/verify-2fa.dto");
const disable_2fa_dto_1 = require("./dto/disable-2fa.dto");
const verify_backup_code_dto_1 = require("./dto/verify-backup-code.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const twofactor_service_1 = require("../twofactor/twofactor.service");
let AuthController = class AuthController {
    constructor(authService, twofactorService) {
        this.authService = authService;
        this.twofactorService = twofactorService;
    }
    setAuthCookies(res, accessToken, refreshToken, rememberMe = false) {
        const accessTokenMaxAge = 15 * 60 * 1000;
        const refreshTokenMaxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000;
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: accessTokenMaxAge,
            path: '/',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshTokenMaxAge,
            path: '/',
        });
    }
    clearAuthCookies(res) {
        res.cookie('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        });
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        });
    }
    async register(dto) {
        const result = await this.authService.register(dto);
        return {
            success: true,
            message: 'Account created successfully. Please check your email to verify your account.',
            data: result,
        };
    }
    async login(dto, req, res) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const result = await this.authService.login(dto, ipAddress, userAgent);
        if (!result.requiresTwoFactor && result.tokens) {
            this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, dto.rememberMe);
        }
        return {
            success: true,
            message: result.requiresTwoFactor
                ? result.message
                : 'Login successful.',
            data: result,
        };
    }
    async refresh(dto, res) {
        const result = await this.authService.refresh(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
            success: true,
            message: 'Token refreshed successfully.',
            data: result,
        };
    }
    async logout(dto, res) {
        const result = await this.authService.logout(dto);
        this.clearAuthCookies(res);
        return {
            success: true,
            message: result.message,
        };
    }
    async getProfile(req) {
        const result = await this.authService.getProfile(req.user.id);
        return {
            success: true,
            data: result,
        };
    }
    async verifyEmail(dto) {
        const result = await this.authService.verifyEmail(dto);
        return {
            success: true,
            message: result.message,
        };
    }
    async verifyEmailCode(dto) {
        const result = await this.authService.verifyEmail({ token: dto.code });
        return {
            success: true,
            message: result.message,
        };
    }
    async resendVerification(dto) {
        const result = await this.authService.resendVerification(dto);
        return {
            success: true,
            message: result.message,
        };
    }
    async forgotPassword(dto) {
        const result = await this.authService.forgotPassword(dto);
        return {
            success: true,
            message: result.message,
        };
    }
    async resetPassword(dto) {
        const result = await this.authService.resetPassword(dto);
        return {
            success: true,
            message: result.message,
        };
    }
    async changePassword(req, dto) {
        const result = await this.authService.changePassword(req.user.id, dto);
        return {
            success: true,
            message: result.message,
        };
    }
    async setup2FA(req) {
        const result = await this.twofactorService.generateSecret(req.user.id, req.user.email);
        const qrCode = await this.twofactorService.generateQRCode(result.qrCodeUrl);
        return {
            success: true,
            message: '2FA secret generated. Scan the QR code with your authenticator app.',
            data: {
                secret: result.secret,
                qrCode,
                manualEntryKey: result.manualEntryKey,
            },
        };
    }
    async enable2FA(req, dto) {
        const result = await this.twofactorService.enable2FA(req.user.id, dto.secret, dto.token);
        return {
            success: true,
            message: '2FA enabled successfully. Save your backup codes in a secure location.',
            data: result,
        };
    }
    async verify2FA(dto, res) {
        const result = await this.authService.verify2FALogin(dto);
        if (result.tokens) {
            this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
        }
        return {
            success: true,
            message: 'Login successful with 2FA.',
            data: result,
        };
    }
    async disable2FA(req, dto) {
        const result = await this.twofactorService.disable2FA(req.user.id, dto.token);
        return {
            success: true,
            message: '2FA disabled successfully.',
            data: { disabled: result },
        };
    }
    async get2FAStatus(req) {
        const status = await this.twofactorService.get2FAStatus(req.user.id);
        return {
            success: true,
            data: status,
        };
    }
    async regenerateBackupCodes(req, dto) {
        const backupCodes = await this.twofactorService.regenerateBackupCodes(req.user.id, dto.token);
        return {
            success: true,
            message: 'Backup codes regenerated. Save them in a secure location.',
            data: { backupCodes },
        };
    }
    async verifyBackupCode(dto, res) {
        const result = await this.authService.verifyBackupCodeLogin(dto);
        if (result.tokens) {
            this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
        }
        return {
            success: true,
            message: result.message || 'Login successful with backup code.',
            data: result,
        };
    }
    async listSessions(req) {
        const sessions = await this.authService.listSessions(req.user.id);
        return {
            success: true,
            data: sessions,
        };
    }
    async revokeSession(req, sessionId) {
        const result = await this.authService.revokeSession(req.user.id, sessionId);
        return {
            success: true,
            message: result.message,
        };
    }
    async revokeAllSessions(req, body) {
        const result = await this.authService.revokeAllSessions(req.user.id, body?.currentSessionId);
        return {
            success: true,
            message: result.message,
        };
    }
    async updateProfile(req, dto) {
        const result = await this.authService.updateProfile(req.user.id, dto);
        return {
            success: true,
            message: 'Profile updated successfully',
            data: result,
        };
    }
    async getNotificationPreferences(req) {
        const result = await this.authService.getNotificationPreferences(req.user.id);
        return {
            success: true,
            data: result,
        };
    }
    async updateNotificationPreferences(req, dto) {
        const result = await this.authService.updateNotificationPreferences(req.user.id, dto);
        return {
            success: true,
            message: 'Notification preferences updated successfully',
            data: result,
        };
    }
    async deactivateAccount(req, dto) {
        const result = await this.authService.deactivateAccount(req.user.id, dto.password);
        return {
            success: true,
            message: result.message,
        };
    }
    async deleteAccount(req, dto) {
        const result = await this.authService.deleteAccount(req.user.id, dto.password, dto.confirmation);
        return {
            success: true,
            message: result.message,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logout_dto_1.LogoutDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('verify-email-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_code_dto_1.VerifyEmailCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailCode", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 3600000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_verification_dto_1.ResendVerificationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 3600000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 900000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 900000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('2fa/setup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2FA", null);
__decorate([
    (0, common_1.Post)('2fa/enable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, enable_2fa_dto_1.Enable2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.Post)('2fa/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_2fa_dto_1.Verify2FADto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FA", null);
__decorate([
    (0, common_1.Post)('2fa/disable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 900000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, disable_2fa_dto_1.Disable2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable2FA", null);
__decorate([
    (0, common_1.Get)('2fa/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get2FAStatus", null);
__decorate([
    (0, common_1.Post)('2fa/backup-codes/regenerate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 3600000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, disable_2fa_dto_1.Disable2FADto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "regenerateBackupCodes", null);
__decorate([
    (0, common_1.Post)('2fa/verify-backup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_backup_code_dto_1.VerifyBackupCodeDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyBackupCode", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Delete)('sessions/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Delete)('sessions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeAllSessions", null);
__decorate([
    (0, common_1.Post)('profile/update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('notifications/preferences'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getNotificationPreferences", null);
__decorate([
    (0, common_1.Post)('notifications/preferences'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, common_1.Post)('account/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 3600000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deactivateAccount", null);
__decorate([
    (0, common_1.Delete)('account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 3600000 } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteAccount", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        twofactor_service_1.TwofactorService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map