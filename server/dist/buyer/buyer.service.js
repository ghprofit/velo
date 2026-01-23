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
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("../stripe/stripe.service");
const email_service_1 = require("../email/email.service");
const s3_service_1 = require("../s3/s3.service");
const redis_service_1 = require("../redis/redis.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
const crypto = __importStar(require("crypto"));
let BuyerService = BuyerService_1 = class BuyerService {
    constructor(prisma, stripeService, emailService, s3Service, redisService, config, notificationsService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.emailService = emailService;
        this.s3Service = s3Service;
        this.redisService = redisService;
        this.config = config;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(BuyerService_1.name);
        this.VERIFICATION_CODE_EXPIRY_MINUTES = 15;
        this.SESSION_EXPIRY_MS =
            (this.config.get('BUYER_SESSION_EXPIRY_HOURS') || 24) * 60 * 60 * 1000;
        this.ACCESS_WINDOW_HOURS =
            this.config.get('BUYER_ACCESS_WINDOW_HOURS') || 24;
        this.ACCESS_BUFFER_MINUTES =
            this.config.get('BUYER_ACCESS_BUFFER_MINUTES') || 30;
        this.MAX_TRUSTED_DEVICES =
            this.config.get('BUYER_MAX_DEVICES') || 3;
        this.VIEW_COOLDOWN_MS =
            (this.config.get('BUYER_VIEW_COOLDOWN_MINUTES') || 5) * 60 * 1000;
        this.logger.log('✓ Buyer service configuration loaded from environment');
    }
    async createOrGetSession(dto, ipAddress, userAgent) {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                if (dto.fingerprint) {
                    const existingSession = await tx.buyerSession.findFirst({
                        where: {
                            fingerprint: dto.fingerprint,
                            expiresAt: { gt: new Date() },
                        },
                    });
                    if (existingSession) {
                        this.logger.log(`Returning existing session for fingerprint: ${dto.fingerprint}`);
                        await tx.buyerSession.update({
                            where: { id: existingSession.id },
                            data: { lastActive: new Date() },
                        });
                        return {
                            id: existingSession.id,
                            sessionToken: existingSession.sessionToken,
                            fingerprint: existingSession.fingerprint,
                            ipAddress: existingSession.ipAddress,
                            expiresAt: existingSession.expiresAt,
                        };
                    }
                }
                const sessionToken = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + this.SESSION_EXPIRY_MS);
                const session = await tx.buyerSession.create({
                    data: {
                        sessionToken,
                        fingerprint: dto.fingerprint || null,
                        ipAddress: ipAddress || null,
                        userAgent: userAgent || null,
                        email: dto.email || null,
                        expiresAt,
                    },
                });
                this.logger.log(`Created new buyer session: ${session.sessionToken}`);
                return {
                    id: session.id,
                    sessionToken: session.sessionToken,
                    fingerprint: session.fingerprint,
                    ipAddress: session.ipAddress,
                    expiresAt: session.expiresAt,
                };
            });
            if (this.redisService.isAvailable()) {
                const cacheKey = `buyer_session:${result.sessionToken}`;
                const sessionData = {
                    id: result.id,
                    sessionToken: result.sessionToken,
                    fingerprint: result.fingerprint,
                    ipAddress: result.ipAddress,
                    expiresAt: result.expiresAt
                };
                await this.redisService.set(cacheKey, JSON.stringify(sessionData), 300);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Failed to create or get session:', error);
            throw new common_1.InternalServerErrorException('Failed to create session');
        }
    }
    async validateSession(sessionToken, expectedFingerprint, ipAddress) {
        if (this.redisService.isAvailable()) {
            const cacheKey = `buyer_session:${sessionToken}`;
            const cachedSession = await this.redisService.get(cacheKey);
            if (cachedSession) {
                const session = typeof cachedSession === 'string' ? JSON.parse(cachedSession) : cachedSession;
                if (new Date(session.expiresAt) > new Date()) {
                    if (session.fingerprint !== expectedFingerprint) {
                        this.logger.warn(`Fingerprint mismatch for cached session ${sessionToken}: expected ${session.fingerprint}, got ${expectedFingerprint}`);
                        throw new common_1.UnauthorizedException('Session fingerprint mismatch - possible session hijacking');
                    }
                    return session;
                }
            }
        }
        const session = await this.prisma.buyerSession.findUnique({
            where: { sessionToken },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Session not found');
        }
        if (session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Session expired');
        }
        if (session.fingerprint !== expectedFingerprint) {
            this.logger.warn(`Fingerprint mismatch for session ${sessionToken}: expected ${session.fingerprint}, got ${expectedFingerprint}`);
            throw new common_1.UnauthorizedException('Session fingerprint mismatch - possible session hijacking');
        }
        if (ipAddress && session.ipAddress && session.ipAddress !== ipAddress) {
            this.logger.warn(`IP address changed for session ${sessionToken}: ${session.ipAddress} → ${ipAddress}`);
            await this.prisma.buyerSession.update({
                where: { id: session.id },
                data: { ipAddress },
            });
        }
        if (this.redisService.isAvailable()) {
            const cacheKey = `buyer_session:${sessionToken}`;
            await this.redisService.set(cacheKey, JSON.stringify(session), 300);
        }
        return session;
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
                contentItems: {
                    select: {
                        id: true,
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
        return {
            id: content.id,
            title: content.title,
            description: content.description,
            price: content.price,
            thumbnailUrl: content.thumbnailUrl,
            contentType: content.contentType,
            duration: content.duration,
            viewCount: content.viewCount,
            purchaseCount: content.purchaseCount,
            itemCount: content.contentItems.length,
            creator: creatorInfo,
        };
    }
    async createPurchase(dto, ipAddress) {
        this.logger.log(`[PURCHASE] Starting purchase creation for content: ${dto.contentId}`);
        this.logger.log(`[PURCHASE] IP Address: ${ipAddress}, Fingerprint: ${dto.fingerprint ? 'present' : 'missing'}`);
        try {
            this.logger.log(`[PURCHASE] Validating session: ${dto.sessionToken}`);
            const session = await this.validateSession(dto.sessionToken, dto.fingerprint, ipAddress);
            this.logger.log(`[PURCHASE] Session validated successfully: ${session.id}`);
            if (dto.email && !session.email) {
                this.logger.log(`[PURCHASE] Updating session with email: ${dto.email}`);
                await this.prisma.buyerSession.update({
                    where: { id: session.id },
                    data: { email: dto.email },
                });
                this.logger.log(`[PURCHASE] ✅ Session email updated successfully`);
            }
            else if (session.email) {
                this.logger.log(`[PURCHASE] Session already has email: ${session.email}`);
            }
            else {
                this.logger.warn(`[PURCHASE] ⚠️ No email provided in purchase request!`);
            }
            this.logger.log(`[PURCHASE] Fetching content: ${dto.contentId}`);
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
                this.logger.error(`[PURCHASE] Content not found: ${dto.contentId}`);
                throw new common_1.NotFoundException('Content not found');
            }
            this.logger.log(`[PURCHASE] Content found: "${content.title}" by ${content.creator.displayName}`);
            this.logger.log(`[PURCHASE] Content status: isPublished=${content.isPublished}, status=${content.status}, price=$${content.price}`);
            if (!content.isPublished || content.status !== 'APPROVED') {
                this.logger.error(`[PURCHASE] Content not available: isPublished=${content.isPublished}, status=${content.status}`);
                throw new common_1.BadRequestException('Content not available for purchase');
            }
            if (!content.price || content.price <= 0) {
                this.logger.error(`[PURCHASE] Invalid price: $${content.price}`);
                throw new common_1.BadRequestException('This content is free or price is not set correctly');
            }
            this.logger.log(`[PURCHASE] Checking for existing purchase`);
            const existingPurchase = await this.prisma.purchase.findFirst({
                where: {
                    contentId: dto.contentId,
                    buyerSessionId: session.id,
                    status: 'COMPLETED',
                },
            });
            if (existingPurchase) {
                this.logger.warn(`[PURCHASE] Duplicate purchase detected: ${existingPurchase.id}`);
                return {
                    alreadyPurchased: true,
                    accessToken: existingPurchase.accessToken,
                };
            }
            const buyerAmount = content.price * 1.1;
            this.logger.log(`[PURCHASE] Calculated amount: base=$${content.price}, buyer pays=$${buyerAmount} (110%)`);
            this.logger.log(`[PURCHASE] Creating Stripe PaymentIntent for $${buyerAmount}`);
            let paymentIntent;
            try {
                paymentIntent = await this.stripeService.createPaymentIntent(buyerAmount, 'usd', {
                    contentId: content.id,
                    contentTitle: content.title,
                    creatorName: content.creator.displayName,
                    sessionId: session.id.toString(),
                });
                this.logger.log(`[PURCHASE] PaymentIntent created successfully: ${paymentIntent.id}`);
            }
            catch (stripeError) {
                this.logger.error('[PURCHASE] Stripe payment intent creation failed:', stripeError);
                throw new common_1.BadRequestException('Failed to initialize payment. Please try again.');
            }
            const accessToken = crypto.randomBytes(32).toString('hex');
            this.logger.log(`[PURCHASE] Generated access token for purchase`);
            this.logger.log(`[PURCHASE] Creating purchase record in database`);
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
            this.logger.log(`[PURCHASE] ✅ Purchase created successfully: ${purchase.id} for content ${dto.contentId}`);
            return {
                purchaseId: purchase.id,
                clientSecret: paymentIntent.client_secret,
                amount: buyerAmount,
                accessToken: purchase.accessToken,
            };
        }
        catch (error) {
            this.logger.error(`[PURCHASE] ❌ Purchase creation FAILED for content ${dto.contentId}`);
            this.logger.error(`[PURCHASE] Error:`, error);
            if (error instanceof Error) {
                this.logger.error(`[PURCHASE] Error message: ${error.message}`);
                this.logger.error(`[PURCHASE] Error stack:`, error.stack);
            }
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('An error occurred while processing your purchase. Please try again.');
        }
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
    async getContentAccess(accessToken) {
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
        if (purchase.accessExpiresAt && purchase.accessExpiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Access has expired');
        }
        if (!purchase.accessWindowStartedAt) {
            const now = new Date();
            const totalMinutes = this.ACCESS_WINDOW_HOURS * 60 + this.ACCESS_BUFFER_MINUTES;
            const expiryMs = totalMinutes * 60 * 1000;
            const expiry = new Date(now.getTime() + expiryMs);
            await this.prisma.purchase.update({
                where: { id: purchase.id },
                data: {
                    accessWindowStartedAt: now,
                    accessExpiresAt: expiry,
                    firstAccessIpAddress: null,
                },
            });
        }
        const now = new Date();
        const VIEW_COOLDOWN_MS = 5 * 60 * 1000;
        const shouldIncrementView = !purchase.lastViewedAt ||
            now.getTime() - purchase.lastViewedAt.getTime() > VIEW_COOLDOWN_MS;
        if (shouldIncrementView) {
            await this.prisma.$transaction(async (tx) => {
                await tx.purchase.update({
                    where: { id: purchase.id },
                    data: {
                        viewCount: { increment: 1 },
                        lastViewedAt: now,
                    },
                });
                await tx.content.update({
                    where: { id: purchase.contentId },
                    data: {
                        viewCount: { increment: 1 },
                    },
                });
            });
            this.logger.log(`View count incremented for purchase ${purchase.id} and content ${purchase.contentId}`);
        }
        else {
            await this.prisma.purchase.update({
                where: { id: purchase.id },
                data: { lastViewedAt: now },
            });
            this.logger.log(`View refreshed for purchase ${purchase.id} (within cooldown)`);
        }
        const creatorInfo = purchase.content.creator.allowBuyerProfileView
            ? {
                displayName: purchase.content.creator.displayName,
                profileImage: purchase.content.creator.profileImage,
            }
            : {
                displayName: purchase.content.creator.displayName,
                profileImage: null,
            };
        console.log('[BUYER SERVICE] Generating signed URLs for', purchase.content.contentItems.length, 'content items');
        const contentItemsWithUrls = await Promise.all(purchase.content.contentItems.map(async (item, index) => {
            console.log(`[BUYER SERVICE] Generating signed URL for item ${index}:`, item.s3Key);
            const signedUrl = await this.s3Service.getSignedUrl(item.s3Key, 86400);
            console.log(`[BUYER SERVICE] Generated signed URL for item ${index}:`, signedUrl?.substring(0, 100) + '...');
            return {
                id: item.id,
                s3Key: item.s3Key,
                s3Bucket: item.s3Bucket,
                order: item.order,
                signedUrl,
            };
        }));
        console.log('[BUYER SERVICE] Content items with URLs:', contentItemsWithUrls.map(item => ({
            id: item.id,
            hasSignedUrl: !!item.signedUrl,
            signedUrlPreview: item.signedUrl?.substring(0, 100),
        })));
        return {
            content: {
                id: purchase.content.id,
                title: purchase.content.title,
                description: purchase.content.description,
                contentType: purchase.content.contentType,
                s3Key: purchase.content.s3Key,
                s3Bucket: purchase.content.s3Bucket,
                thumbnailUrl: purchase.content.thumbnailUrl,
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
        const idempotencyKey = `client_${paymentIntentId}_${Date.now()}`;
        const result = await this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.findUnique({
                where: { id: purchaseId },
                include: {
                    content: {
                        include: { creator: true },
                    },
                },
            });
            if (!purchase) {
                this.logger.error(`Purchase not found: ${purchaseId}`);
                throw new common_1.NotFoundException('Purchase not found');
            }
            if (!purchase.content.isPublished) {
                this.logger.error(`Cannot complete purchase ${purchaseId}: content ${purchase.contentId} is no longer published`);
                throw new common_1.BadRequestException('Content is no longer available for purchase');
            }
            if (purchase.content.status !== 'APPROVED') {
                this.logger.error(`Cannot complete purchase ${purchaseId}: content ${purchase.contentId} status is ${purchase.content.status}`);
                throw new common_1.BadRequestException('Content is not approved for purchase');
            }
            if (purchase.paymentIntentId !== paymentIntentId) {
                this.logger.error(`Payment intent mismatch for purchase ${purchaseId}: expected ${purchase.paymentIntentId}, got ${paymentIntentId}`);
                throw new common_1.BadRequestException('Payment intent mismatch');
            }
            if (purchase.status === 'COMPLETED') {
                this.logger.log(`Purchase ${purchaseId} already completed by ${purchase.completedBy}`);
                return {
                    purchaseId: purchase.id,
                    accessToken: purchase.accessToken,
                    status: 'COMPLETED',
                };
            }
            const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                this.logger.error(`Payment intent ${paymentIntentId} status is ${paymentIntent.status}, expected succeeded`);
                throw new common_1.BadRequestException('Payment not completed');
            }
            const updatedPurchase = await tx.purchase.update({
                where: { id: purchase.id },
                data: {
                    status: 'COMPLETED',
                    transactionId: paymentIntentId,
                    completionIdempotencyKey: idempotencyKey,
                    completedBy: 'CLIENT',
                    completedAt: new Date(),
                },
            });
            this.logger.log(`✅ Purchase ${updatedPurchase.id} updated to COMPLETED status`);
            this.logger.log(`💾 Transaction ID: ${updatedPurchase.transactionId}`);
            this.logger.log(`🔑 Access Token: ${updatedPurchase.accessToken.substring(0, 20)}...`);
            await tx.content.update({
                where: { id: purchase.contentId },
                data: {
                    purchaseCount: { increment: 1 },
                    totalRevenue: { increment: purchase.amount },
                },
            });
            const creatorEarnings = purchase.basePrice
                ? purchase.basePrice * 0.9
                : purchase.amount * 0.85;
            const earningsPendingUntil = new Date();
            earningsPendingUntil.setHours(earningsPendingUntil.getHours() + 24);
            await tx.purchase.update({
                where: { id: purchase.id },
                data: {
                    earningsPendingUntil,
                    earningsReleased: false,
                },
            });
            await tx.creatorProfile.update({
                where: { id: purchase.content.creatorId },
                data: {
                    totalEarnings: { increment: creatorEarnings },
                    pendingBalance: { increment: creatorEarnings },
                    totalPurchases: { increment: 1 },
                },
            });
            this.logger.log(`Purchase ${purchaseId} confirmed by CLIENT with idempotency key ${idempotencyKey}`);
            this.logger.log(`💰 Creator earnings updated: +$${creatorEarnings.toFixed(2)}`);
            return {
                purchaseId: purchase.id,
                accessToken: purchase.accessToken,
                status: 'COMPLETED',
                _internal: {
                    contentId: purchase.contentId,
                    creatorId: purchase.content.creatorId,
                    creatorEarnings,
                    amount: purchase.amount,
                },
            };
        }, { maxWait: 5000, timeout: 10000 });
        if (result.status === 'COMPLETED') {
            this.logger.log(`[EMAIL] Processing emails for completed purchase ${result.purchaseId}`);
            const purchaseWithRelations = await this.prisma.purchase.findUnique({
                where: { id: result.purchaseId },
                include: {
                    content: {
                        include: {
                            creator: {
                                include: { user: true },
                            },
                        },
                    },
                    buyerSession: true,
                },
            });
            if (!purchaseWithRelations) {
                this.logger.error(`[EMAIL] ❌ Could not fetch purchase ${result.purchaseId} for email sending`);
            }
            else if (!purchaseWithRelations.content) {
                this.logger.error(`[EMAIL] ❌ Purchase ${result.purchaseId} has no content`);
            }
            else {
                const clientUrl = this.config.get('CLIENT_URL') || 'http://localhost:3000';
                const content = purchaseWithRelations.content;
                const creator = content.creator;
                const creatorEarnings = purchaseWithRelations.basePrice
                    ? purchaseWithRelations.basePrice * 0.9
                    : purchaseWithRelations.amount * 0.85;
                const buyerEmail = purchaseWithRelations.buyerSession?.email;
                if (buyerEmail) {
                    try {
                        await this.emailService.sendPurchaseReceipt(buyerEmail, {
                            buyer_email: buyerEmail,
                            content_title: content.title,
                            amount: purchaseWithRelations.amount.toFixed(2),
                            date: new Date().toLocaleDateString(),
                            access_link: `${clientUrl}/c/${purchaseWithRelations.contentId}?token=${purchaseWithRelations.accessToken}`,
                            transaction_id: paymentIntentId,
                        });
                        this.logger.log(`[EMAIL] ✅ Purchase receipt sent to ${buyerEmail}`);
                    }
                    catch (error) {
                        this.logger.error(`[EMAIL] ❌ Failed to send purchase receipt:`, error);
                    }
                }
                else {
                    this.logger.warn(`[EMAIL] ⚠️ No buyer email found for purchase ${result.purchaseId}`);
                }
                if (creator && creator.user) {
                    const creatorUser = creator.user;
                    const creatorEmail = creatorUser.email;
                    const creatorName = creator.displayName;
                    try {
                        await this.emailService.sendCreatorSaleNotification(creatorEmail, {
                            creator_name: creatorName,
                            content_title: content.title,
                            amount: creatorEarnings.toFixed(2),
                            date: new Date().toLocaleDateString(),
                        });
                        this.logger.log(`[EMAIL] ✅ Creator sale notification sent to ${creatorEmail}`);
                    }
                    catch (error) {
                        this.logger.error(`[EMAIL] ❌ Failed to send creator sale notification:`, error);
                    }
                    try {
                        await this.notificationsService.notify(creatorUser.id, create_notification_dto_1.NotificationType.PURCHASE_MADE, 'Your Content Was Purchased!', `Your content "${content.title}" was purchased! You earned $${creatorEarnings.toFixed(2)}`, {
                            purchaseId: result.purchaseId,
                            contentId: purchaseWithRelations.contentId,
                            earnings: creatorEarnings,
                        });
                        this.logger.log(`[NOTIFICATION] ✅ Creator notification created`);
                    }
                    catch (error) {
                        this.logger.error(`[NOTIFICATION] ❌ Failed to create creator notification:`, error);
                    }
                    try {
                        await this.notificationsService.notifyAdmins(create_notification_dto_1.NotificationType.PURCHASE_MADE, 'New Purchase on Platform', `A new purchase was made: "${content.title}" by ${creatorName} for $${purchaseWithRelations.amount.toFixed(2)}`, {
                            purchaseId: result.purchaseId,
                            contentId: purchaseWithRelations.contentId,
                            creatorName,
                            amount: purchaseWithRelations.amount,
                        });
                        this.logger.log(`[NOTIFICATION] ✅ Admin notifications created`);
                    }
                    catch (error) {
                        this.logger.error(`[NOTIFICATION] ❌ Failed to notify admins:`, error);
                    }
                }
                else {
                    this.logger.warn(`[EMAIL] ⚠️ No creator found for purchase ${result.purchaseId}`);
                }
            }
        }
        return {
            purchaseId: result.purchaseId,
            accessToken: result.accessToken,
            status: result.status,
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
    async requestDeviceVerification(accessToken, fingerprint) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { accessToken },
            include: {
                buyerSession: true,
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found');
        }
        const email = purchase.buyerSession.email;
        if (!email) {
            throw new common_1.BadRequestException('No email associated with this purchase');
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
    async cleanupExpiredData() {
        this.logger.log('Starting cleanup of expired purchases and sessions');
        try {
            const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
            const deletedPurchases = await this.prisma.purchase.deleteMany({
                where: {
                    accessWindowStartedAt: {
                        not: null,
                    },
                    OR: [
                        {
                            accessWindowStartedAt: {
                                lt: new Date(cutoffDate.getTime() -
                                    this.ACCESS_WINDOW_HOURS * 60 * 60 * 1000 -
                                    this.ACCESS_BUFFER_MINUTES * 60 * 1000),
                            },
                        },
                        {
                            status: 'FAILED',
                            createdAt: {
                                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                            },
                        },
                    ],
                },
            });
            const deletedSessions = await this.prisma.buyerSession.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });
            this.logger.log(`Cleanup completed successfully: ${deletedPurchases.count} purchases and ${deletedSessions.count} sessions deleted`);
            return {
                success: true,
                deletedPurchases: deletedPurchases.count,
                deletedSessions: deletedSessions.count,
            };
        }
        catch (error) {
            this.logger.error('Failed to cleanup expired data:', error);
            throw error;
        }
    }
    async resendInvoice(purchaseId, buyerEmail) {
        this.logger.log(`[INVOICE] Attempting to resend invoice for purchase ${purchaseId} to ${buyerEmail}`);
        try {
            const purchase = await this.prisma.purchase.findUnique({
                where: { id: purchaseId },
                include: {
                    content: {
                        include: {
                            creator: {
                                include: { user: true },
                            },
                        },
                    },
                    buyerSession: true,
                },
            });
            if (!purchase) {
                this.logger.error(`[INVOICE] Purchase not found: ${purchaseId}`);
                throw new common_1.NotFoundException(`Purchase ${purchaseId} not found`);
            }
            if (purchase.status !== 'COMPLETED') {
                this.logger.error(`[INVOICE] Cannot resend invoice for incomplete purchase: ${purchaseId} (status: ${purchase.status})`);
                throw new common_1.BadRequestException(`Cannot send invoice for purchase with status: ${purchase.status}`);
            }
            const sessionEmail = purchase.buyerSession?.email;
            if (sessionEmail && sessionEmail !== buyerEmail) {
                this.logger.warn(`[INVOICE] Email mismatch for purchase ${purchaseId}. Session: ${sessionEmail}, Requested: ${buyerEmail}`);
                throw new common_1.UnauthorizedException('Email does not match purchase record');
            }
            const clientUrl = this.config.get('CLIENT_URL') || 'http://localhost:3000';
            const emailResult = await this.emailService.sendPurchaseReceipt(buyerEmail, {
                buyer_email: buyerEmail,
                content_title: purchase.content.title,
                amount: purchase.amount.toFixed(2),
                date: purchase.createdAt.toLocaleDateString(),
                access_link: `${clientUrl}/c/${purchase.contentId}?token=${purchase.accessToken}`,
                transaction_id: purchase.transactionId || purchase.paymentIntentId || 'N/A',
            });
            if (!emailResult.success) {
                this.logger.error(`[INVOICE] Failed to send invoice for purchase ${purchaseId}:`, emailResult.error);
                throw new common_1.InternalServerErrorException(`Failed to send invoice: ${emailResult.error}`);
            }
            this.logger.log(`[INVOICE] ✅ Invoice resent successfully for purchase ${purchaseId} to ${buyerEmail}. MessageId: ${emailResult.messageId}`);
            return {
                success: true,
                message: 'Invoice sent successfully',
                messageId: emailResult.messageId,
            };
        }
        catch (error) {
            this.logger.error(`[INVOICE] Failed to resend invoice:`, error);
            throw error;
        }
    }
};
exports.BuyerService = BuyerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BuyerService.prototype, "cleanupExpiredData", null);
exports.BuyerService = BuyerService = BuyerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        email_service_1.EmailService,
        s3_service_1.S3Service,
        redis_service_1.RedisService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], BuyerService);
//# sourceMappingURL=buyer.service.js.map