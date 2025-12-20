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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const twofactor_service_1 = require("../twofactor/twofactor.service");
const redis_service_1 = require("../redis/redis.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, config, emailService, twofactorService, redisService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.emailService = emailService;
        this.twofactorService = twofactorService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.MAX_LOGIN_ATTEMPTS = 5;
        this.LOCKOUT_DURATION = 1800;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email already exists.');
        }
        const hashedPassword = await this.hashPassword(dto.password);
        try {
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
                            country: dto.country || null,
                        },
                    },
                },
                include: {
                    creatorProfile: true,
                },
            });
            const tokens = this.generateTokenPair({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            await this.prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: tokens.refreshToken,
                    expiresAt: this.getRefreshTokenExpiration(),
                    deviceName: 'Unknown Device',
                    lastUsedAt: new Date(),
                },
            });
            try {
                await this.generateVerificationToken(user.id, user.email);
            }
            catch (error) {
                console.error('Failed to generate verification token:', error);
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
        }
        catch (error) {
            console.error('Registration error:', error);
            throw new common_1.InternalServerErrorException('An error occurred during registration. Please try again.');
        }
    }
    async login(dto, ipAddress, userAgent) {
        const email = dto.email.toLowerCase();
        const loginKey = `login:${email}:${ipAddress || 'unknown'}`;
        const isLocked = await this.isAccountLocked(loginKey);
        if (isLocked) {
            const ttl = await this.redisService.ttl(loginKey);
            const minutesRemaining = Math.ceil(ttl / 60);
            throw new common_1.ForbiddenException(`Account temporarily locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.`);
        }
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
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Your account has been deactivated. Please contact support.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            await this.recordFailedLogin(loginKey);
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        await this.clearFailedLogins(loginKey);
        if (user.twoFactorEnabled) {
            const tempToken = this.jwtService.sign({
                userId: user.id,
                email: user.email,
                purpose: '2fa-pending',
                ipAddress,
                userAgent,
            }, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: '5m',
            });
            return {
                requiresTwoFactor: true,
                tempToken,
                message: 'Please provide your 2FA code to complete login.',
            };
        }
        const tokens = this.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: this.getRefreshTokenExpiration(),
                deviceName: this.extractDeviceName(userAgent),
                ipAddress: ipAddress || null,
                userAgent: userAgent || null,
                lastUsedAt: new Date(),
            },
        });
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
    async refresh(dto) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: dto.refreshToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            const tokens = this.generateTokenPair({
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            });
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
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
    }
    async logout(dto) {
        await this.prisma.refreshToken.deleteMany({
            where: { token: dto.refreshToken },
        });
        return { message: 'Logged out successfully.' };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                creatorProfile: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found.');
        }
        let computedStats = {
            totalEarnings: 0,
            totalViews: 0,
            totalPurchases: 0,
        };
        if (user.creatorProfile) {
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
            const contents = await this.prisma.content.findMany({
                where: {
                    creatorId: user.creatorProfile.id,
                },
                select: {
                    viewCount: true,
                    purchaseCount: true,
                },
            });
            computedStats.totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);
            computedStats.totalPurchases = purchases.length;
            computedStats.totalViews = contents.reduce((sum, c) => sum + c.viewCount, 0);
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
            creatorProfile: user.creatorProfile
                ? {
                    ...user.creatorProfile,
                    totalEarnings: computedStats.totalEarnings,
                    totalViews: computedStats.totalViews,
                    totalPurchases: computedStats.totalPurchases,
                }
                : null,
        };
    }
    async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }
    generateTokenPair(payload) {
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
        };
    }
    getRefreshTokenExpiration() {
        const expirationTime = 7 * 24 * 60 * 60 * 1000;
        return new Date(Date.now() + expirationTime);
    }
    async verifyEmail(dto) {
        const verificationToken = await this.prisma.emailVerificationToken.findUnique({
            where: { token: dto.token },
            include: { user: true },
        });
        if (!verificationToken) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (verificationToken.expiresAt < new Date()) {
            await this.prisma.emailVerificationToken.delete({
                where: { id: verificationToken.id },
            });
            throw new common_1.BadRequestException('Verification token has expired. Please request a new one.');
        }
        await this.prisma.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: true },
        });
        await this.prisma.emailVerificationToken.delete({
            where: { id: verificationToken.id },
        });
        return {
            message: 'Email verified successfully',
        };
    }
    async resendVerification(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.emailVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        await this.prisma.emailVerificationToken.deleteMany({
            where: { userId: user.id },
        });
        await this.generateVerificationToken(user.id, user.email);
        return {
            message: 'Verification email sent successfully',
        };
    }
    async generateVerificationToken(userId, email) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiryHours = parseInt(this.config.get('EMAIL_VERIFICATION_TOKEN_EXPIRY') || '86400') / 3600;
        const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
        await this.prisma.emailVerificationToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
        const verificationLink = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;
        try {
            await this.emailService.sendEmailVerification(email, email.split('@')[0] || 'User', verificationLink, expiryHours);
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
        return token;
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            return {
                message: 'If an account with that email exists, a password reset link has been sent.',
            };
        }
        await this.prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });
        const token = crypto.randomBytes(32).toString('hex');
        const expirySeconds = parseInt(this.config.get('PASSWORD_RESET_TOKEN_EXPIRY') || '3600');
        const expiresAt = new Date(Date.now() + expirySeconds * 1000);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });
        const resetLink = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
        try {
            await this.emailService.sendPasswordReset(user.email, user.email.split('@')[0] || 'User', resetLink, expirySeconds / 60);
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
        return {
            message: 'If an account with that email exists, a password reset link has been sent.',
        };
    }
    async resetPassword(dto) {
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token: dto.token },
            include: { user: true },
        });
        if (!resetToken || resetToken.used) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (resetToken.expiresAt < new Date()) {
            await this.prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            });
            throw new common_1.BadRequestException('Reset token has expired. Please request a new one.');
        }
        const hashedPassword = await this.hashPassword(dto.newPassword);
        await this.prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });
        await this.prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        });
        await this.prisma.refreshToken.deleteMany({
            where: { userId: resetToken.userId },
        });
        return {
            message: 'Password reset successfully. Please login with your new password.',
        };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await this.hashPassword(dto.newPassword);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return {
            message: 'Password changed successfully',
        };
    }
    async verify2FALogin(dto) {
        let payload;
        try {
            payload = this.jwtService.verify(dto.tempToken, {
                secret: this.config.get('JWT_SECRET'),
            });
            if (payload.purpose !== '2fa-pending') {
                throw new common_1.UnauthorizedException('Invalid token purpose');
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired temporary token');
        }
        const verified = await this.twofactorService.verifyToken(payload.userId, dto.token);
        if (!verified) {
            throw new common_1.UnauthorizedException('Invalid 2FA code');
        }
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
            throw new common_1.UnauthorizedException('User not found');
        }
        const tokens = this.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: this.getRefreshTokenExpiration(),
                deviceName: this.extractDeviceName(payload.userAgent),
                ipAddress: payload.ipAddress || null,
                userAgent: payload.userAgent || null,
                lastUsedAt: new Date(),
            },
        });
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
    async verifyBackupCodeLogin(dto) {
        let payload;
        try {
            payload = this.jwtService.verify(dto.tempToken, {
                secret: this.config.get('JWT_SECRET'),
            });
            if (payload.purpose !== '2fa-pending') {
                throw new common_1.UnauthorizedException('Invalid token purpose');
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired temporary token');
        }
        const verified = await this.twofactorService.verifyBackupCode(payload.userId, dto.backupCode);
        if (!verified) {
            throw new common_1.UnauthorizedException('Invalid backup code');
        }
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
            throw new common_1.UnauthorizedException('User not found');
        }
        const tokens = this.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: this.getRefreshTokenExpiration(),
                deviceName: this.extractDeviceName(payload.userAgent),
                ipAddress: payload.ipAddress || null,
                userAgent: payload.userAgent || null,
                lastUsedAt: new Date(),
            },
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        const remainingCodes = await this.twofactorService.getRemainingBackupCodesCount(user.id);
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
    extractDeviceName(userAgent) {
        if (!userAgent)
            return 'Unknown Device';
        if (userAgent.includes('Mobile'))
            return 'Mobile Device';
        if (userAgent.includes('Tablet'))
            return 'Tablet';
        if (userAgent.includes('Windows'))
            return 'Windows PC';
        if (userAgent.includes('Macintosh'))
            return 'Mac';
        if (userAgent.includes('Linux'))
            return 'Linux PC';
        return 'Unknown Device';
    }
    async listSessions(userId) {
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
    async revokeSession(userId, sessionId) {
        const session = await this.prisma.refreshToken.findUnique({
            where: { id: sessionId },
        });
        if (!session || session.userId !== userId) {
            throw new common_1.NotFoundException('Session not found');
        }
        await this.prisma.refreshToken.delete({
            where: { id: sessionId },
        });
        return {
            message: 'Session revoked successfully',
        };
    }
    async revokeAllSessions(userId, currentSessionId) {
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
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { creatorProfile: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email && dto.email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email.toLowerCase() },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email is already in use');
            }
        }
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
    async getNotificationPreferences(userId) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateNotificationPreferences(userId, dto) {
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
    async deactivateAccount(userId, password) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
        return { message: 'Account deactivated successfully' };
    }
    async deleteAccount(userId, password, confirmation) {
        if (confirmation !== 'DELETE MY ACCOUNT') {
            throw new common_1.BadRequestException('Invalid confirmation string');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { creatorProfile: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        if (user.creatorProfile && user.creatorProfile.totalEarnings > 0) {
            throw new common_1.BadRequestException('Cannot delete account with pending earnings. Please withdraw all funds first.');
        }
        await this.prisma.user.delete({
            where: { id: userId },
        });
        this.logger.log(`Account deleted permanently: ${user.email}`);
        return { message: 'Account deleted permanently' };
    }
    async isAccountLocked(loginKey) {
        const attempts = await this.redisService.get(loginKey);
        return attempts !== null && parseInt(attempts) >= this.MAX_LOGIN_ATTEMPTS;
    }
    async recordFailedLogin(loginKey) {
        const attempts = await this.redisService.incr(loginKey);
        if (attempts === 1) {
            await this.redisService.expire(loginKey, this.LOCKOUT_DURATION);
        }
        if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
            this.logger.warn(`Account locked: ${loginKey} after ${attempts} failed attempts`);
        }
    }
    async clearFailedLogins(loginKey) {
        await this.redisService.del(loginKey);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService,
        twofactor_service_1.TwofactorService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map