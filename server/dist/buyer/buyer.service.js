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
var BuyerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("../stripe/stripe.service");
const email_service_1 = require("../email/email.service");
const s3_service_1 = require("../s3/s3.service");
const crypto = __importStar(require("crypto"));
let BuyerService = BuyerService_1 = class BuyerService {
    constructor(prisma, stripeService, emailService, s3Service) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.emailService = emailService;
        this.s3Service = s3Service;
        this.logger = new common_1.Logger(BuyerService_1.name);
        this.MAX_TRUSTED_DEVICES = 3;
        this.ACCESS_WINDOW_HOURS = 24;
        this.VERIFICATION_CODE_EXPIRY_MINUTES = 15;
    }
    async createOrGetSession(dto, ipAddress, userAgent) {
        if (dto.fingerprint) {
            const existingSession = await this.prisma.buyerSession.findFirst({
                where: {
                    fingerprint: dto.fingerprint,
                    expiresAt: { gt: new Date() },
                },
            });
            if (existingSession) {
                await this.prisma.buyerSession.update({
                    where: { id: existingSession.id },
                    data: { lastActive: new Date() },
                });
                return {
                    sessionToken: existingSession.sessionToken,
                    expiresAt: existingSession.expiresAt,
                };
            }
        }
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const session = await this.prisma.buyerSession.create({
            data: {
                sessionToken,
                fingerprint: dto.fingerprint || null,
                ipAddress: ipAddress || null,
                userAgent: userAgent || null,
                email: dto.email || null,
                expiresAt,
            },
        });
        return {
            sessionToken: session.sessionToken,
            expiresAt: session.expiresAt,
        };
    }
    async getContentDetails(contentId) {
        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true,
                        verificationStatus: true,
                        allowBuyerProfileView: true,
                    },
                },
            },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found');
        }
        if (!content.isPublished || content.status !== 'APPROVED') {
            throw new common_1.NotFoundException('Content not available');
        }
        const creatorInfo = content.creator.allowBuyerProfileView
            ? {
                id: content.creator.id,
                displayName: content.creator.displayName,
                profileImage: content.creator.profileImage,
                verificationStatus: content.creator.verificationStatus,
            }
            : {
                id: content.creator.id,
                displayName: content.creator.displayName,
                profileImage: null,
                verificationStatus: content.creator.verificationStatus,
            };
        const thumbnailUrl = content.s3Key
            ? await this.s3Service.getSignedUrl(content.s3Key, 86400)
            : content.thumbnailUrl;
        return {
            id: content.id,
            title: content.title,
            description: content.description,
            price: content.price,
            thumbnailUrl,
            contentType: content.contentType,
            duration: content.duration,
            viewCount: content.viewCount,
            purchaseCount: content.purchaseCount,
            creator: creatorInfo,
        };
    }
    async createPurchase(dto, ipAddress) {
        const session = await this.prisma.buyerSession.findUnique({
            where: { sessionToken: dto.sessionToken },
        });
        if (!session || session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired session');
        }
        if (dto.email && !session.email) {
            await this.prisma.buyerSession.update({
                where: { id: session.id },
                data: { email: dto.email },
            });
        }
        const content = await this.prisma.content.findUnique({
            where: { id: dto.contentId },
            include: {
                creator: {
                    select: {
                        displayName: true,
                    },
                },
            },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found');
        }
        if (!content.isPublished || content.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Content not available for purchase');
        }
        const existingPurchase = await this.prisma.purchase.findFirst({
            where: {
                contentId: dto.contentId,
                buyerSessionId: session.id,
                status: 'COMPLETED',
            },
        });
        if (existingPurchase) {
            return {
                alreadyPurchased: true,
                accessToken: existingPurchase.accessToken,
            };
        }
        const buyerAmount = content.price * 1.10;
        const paymentIntent = await this.stripeService.createPaymentIntent(buyerAmount, 'usd', {
            contentId: content.id,
            contentTitle: content.title,
            creatorName: content.creator.displayName,
            sessionId: session.id.toString(),
        });
        const accessToken = crypto.randomBytes(32).toString('hex');
        const purchase = await this.prisma.purchase.create({
            data: {
                contentId: dto.contentId,
                buyerSessionId: session.id,
                amount: buyerAmount,
                basePrice: content.price,
                currency: 'USD',
                paymentProvider: 'STRIPE',
                paymentIntentId: paymentIntent.id,
                status: 'PENDING',
                accessToken,
                purchaseFingerprint: dto.fingerprint || null,
                trustedFingerprints: dto.fingerprint ? [dto.fingerprint] : [],
                purchaseIpAddress: ipAddress || null,
            },
        });
        return {
            purchaseId: purchase.id,
            clientSecret: paymentIntent.client_secret,
            amount: buyerAmount,
            accessToken: purchase.accessToken,
        };
    }
    async verifyPurchase(purchaseId) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: {
                content: {
                    select: {
                        id: true,
                        title: true,
                        contentType: true,
                    },
                },
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        return {
            id: purchase.id,
            status: purchase.status,
            accessToken: purchase.accessToken,
            content: purchase.content,
        };
    }
    async getContentAccess(accessToken, fingerprint, ipAddress) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { accessToken },
            include: {
                content: {
                    include: {
                        creator: {
                            select: {
                                displayName: true,
                                profileImage: true,
                                allowBuyerProfileView: true,
                            },
                        },
                        contentItems: true,
                    },
                },
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        if (purchase.status !== 'COMPLETED') {
            throw new common_1.UnauthorizedException('Purchase not completed');
        }
        if (!purchase.trustedFingerprints.includes(fingerprint)) {
            throw new common_1.UnauthorizedException('Device not verified');
        }
        if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Access has expired');
        }
        if (!purchase.accessWindowStartedAt) {
            const now = new Date();
            const expiry = new Date(now.getTime() + this.ACCESS_WINDOW_HOURS * 60 * 60 * 1000);
            await this.prisma.purchase.update({
                where: { id: purchase.id },
                data: {
                    accessWindowStartedAt: now,
                    accessExpiresAt: expiry,
                    firstAccessIpAddress: ipAddress,
                },
            });
        }
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date(),
            },
        });
        await this.prisma.content.update({
            where: { id: purchase.contentId },
            data: {
                viewCount: { increment: 1 },
            },
        });
        const creatorInfo = purchase.content.creator.allowBuyerProfileView
            ? {
                displayName: purchase.content.creator.displayName,
                profileImage: purchase.content.creator.profileImage,
            }
            : {
                displayName: purchase.content.creator.displayName,
                profileImage: null,
            };
        const thumbnailUrl = purchase.content.s3Key
            ? await this.s3Service.getSignedUrl(purchase.content.s3Key, 86400)
            : purchase.content.thumbnailUrl;
        const contentItemsWithUrls = await Promise.all(purchase.content.contentItems.map(async (item) => ({
            id: item.id,
            s3Key: item.s3Key,
            s3Bucket: item.s3Bucket,
            order: item.order,
            signedUrl: await this.s3Service.getSignedUrl(item.s3Key, 86400),
        })));
        return {
            content: {
                id: purchase.content.id,
                title: purchase.content.title,
                description: purchase.content.description,
                contentType: purchase.content.contentType,
                s3Key: purchase.content.s3Key,
                s3Bucket: purchase.content.s3Bucket,
                thumbnailUrl,
                duration: purchase.content.duration,
                creator: creatorInfo,
                contentItems: contentItemsWithUrls,
            },
            purchase: {
                viewCount: purchase.viewCount + 1,
                purchasedAt: purchase.createdAt,
            },
        };
    }
    async getSessionPurchases(sessionToken) {
        const session = await this.prisma.buyerSession.findUnique({
            where: { sessionToken },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const purchases = await this.prisma.purchase.findMany({
            where: {
                buyerSessionId: session.id,
                status: 'COMPLETED',
            },
            include: {
                content: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        contentType: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return purchases.map((p) => ({
            id: p.id,
            accessToken: p.accessToken,
            purchasedAt: p.createdAt,
            viewCount: p.viewCount,
            content: p.content,
        }));
    }
    async confirmPurchase(purchaseId, paymentIntentId) {
        this.logger.log(`Confirming purchase ${purchaseId} with payment intent ${paymentIntentId}`);
        const purchase = await this.prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: {
                content: {
                    include: {
                        creator: true,
                    },
                },
            },
        });
        if (!purchase) {
            this.logger.error(`Purchase not found: ${purchaseId}`);
            throw new common_1.NotFoundException('Purchase not found');
        }
        if (purchase.paymentIntentId !== paymentIntentId) {
            this.logger.error(`Payment intent mismatch for purchase ${purchaseId}: expected ${purchase.paymentIntentId}, got ${paymentIntentId}`);
            throw new common_1.BadRequestException('Payment intent mismatch');
        }
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            this.logger.error(`Payment intent ${paymentIntentId} status is ${paymentIntent.status}, expected succeeded`);
            throw new common_1.BadRequestException('Payment not completed');
        }
        if (purchase.status === 'COMPLETED') {
            this.logger.log(`Purchase ${purchase.id} already completed, returning existing data`);
            return {
                purchaseId: purchase.id,
                accessToken: purchase.accessToken,
                status: purchase.status,
            };
        }
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                status: 'COMPLETED',
                transactionId: paymentIntentId,
            },
        });
        await this.prisma.content.update({
            where: { id: purchase.contentId },
            data: {
                purchaseCount: { increment: 1 },
                totalRevenue: { increment: purchase.amount },
            },
        });
        const creatorEarnings = purchase.basePrice
            ? purchase.basePrice * 0.90
            : purchase.amount * 0.85;
        await this.prisma.creatorProfile.update({
            where: { id: purchase.content.creatorId },
            data: {
                totalEarnings: { increment: creatorEarnings },
                totalPurchases: { increment: 1 },
            },
        });
        this.logger.log(`Purchase ${purchase.id} confirmed by client`);
        return {
            purchaseId: purchase.id,
            accessToken: purchase.accessToken,
            status: 'COMPLETED',
        };
    }
    async checkAccessEligibility(accessToken, fingerprint) {
        this.logger.log(`Checking access eligibility for token: ${accessToken?.substring(0, 10)}...`);
        const purchase = await this.prisma.purchase.findUnique({
            where: { accessToken },
        });
        if (!purchase) {
            this.logger.warn(`No purchase found for access token: ${accessToken?.substring(0, 10)}...`);
            return {
                hasAccess: false,
                reason: 'Invalid purchase - not found',
            };
        }
        if (purchase.status !== 'COMPLETED') {
            this.logger.warn(`Purchase ${purchase.id} status is ${purchase.status}, expected COMPLETED`);
            return {
                hasAccess: false,
                reason: `Invalid purchase - status is ${purchase.status}`,
            };
        }
        if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
            return {
                hasAccess: false,
                isExpired: true,
                reason: 'Your 24-hour access has expired',
            };
        }
        const isTrusted = purchase.trustedFingerprints.includes(fingerprint);
        if (!isTrusted) {
            return {
                hasAccess: false,
                needsEmailVerification: true,
                reason: 'Accessing from new device',
                canAddMoreDevices: purchase.trustedFingerprints.length < this.MAX_TRUSTED_DEVICES,
            };
        }
        return {
            hasAccess: true,
            accessExpiresAt: purchase.accessExpiresAt,
            timeRemaining: purchase.accessExpiresAt
                ? purchase.accessExpiresAt.getTime() - Date.now()
                : null,
        };
    }
    async requestDeviceVerification(accessToken, fingerprint, email) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { accessToken },
            include: {
                buyerSession: true,
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        if (purchase.buyerSession.email !== email) {
            throw new common_1.UnauthorizedException('Email mismatch');
        }
        if (purchase.trustedFingerprints.length >= this.MAX_TRUSTED_DEVICES) {
            throw new common_1.BadRequestException('Maximum devices reached');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + this.VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);
        const codes = purchase.deviceVerificationCodes || [];
        codes.push({ code, fingerprint, expiresAt: expiresAt.toISOString() });
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: { deviceVerificationCodes: codes },
        });
        await this.emailService.sendEmail({
            to: email,
            subject: 'Device Verification Code',
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Device Verification</h2>
        <p>You're attempting to access purchased content from a new device.</p>
        <p>Your verification code is:</p>
        <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 8px;">${code}</h1>
        <p>This code will expire in ${this.VERIFICATION_CODE_EXPIRY_MINUTES} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>`,
        });
        return { success: true };
    }
    async verifyDeviceCode(accessToken, fingerprint, verificationCode) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { accessToken },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        const codes = purchase.deviceVerificationCodes || [];
        const validCode = codes.find((c) => c.code === verificationCode &&
            c.fingerprint === fingerprint &&
            new Date(c.expiresAt) > new Date());
        if (!validCode) {
            throw new common_1.UnauthorizedException('Invalid or expired verification code');
        }
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                trustedFingerprints: [...purchase.trustedFingerprints, fingerprint],
                deviceVerificationCodes: codes.filter((c) => c.code !== verificationCode),
            },
        });
        return { success: true };
    }
};
exports.BuyerService = BuyerService;
exports.BuyerService = BuyerService = BuyerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        email_service_1.EmailService,
        s3_service_1.S3Service])
], BuyerService);
//# sourceMappingURL=buyer.service.js.map