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
const crypto = __importStar(require("crypto"));
let BuyerService = BuyerService_1 = class BuyerService {
    constructor(prisma, stripeService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.logger = new common_1.Logger(BuyerService_1.name);
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
            creator: creatorInfo,
        };
    }
    async createPurchase(dto) {
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
        const paymentIntent = await this.stripeService.createPaymentIntent(content.price, 'usd', {
            contentId: content.id,
            contentTitle: content.title,
            creatorName: content.creator.displayName,
            sessionId: session.id,
        });
        const accessToken = crypto.randomBytes(32).toString('hex');
        const purchase = await this.prisma.purchase.create({
            data: {
                contentId: dto.contentId,
                buyerSessionId: session.id,
                amount: content.price,
                currency: 'USD',
                paymentProvider: 'STRIPE',
                paymentIntentId: paymentIntent.id,
                status: 'PENDING',
                accessToken,
            },
        });
        await this.stripeService.getStripeInstance().paymentIntents.update(paymentIntent.id, {
            metadata: {
                ...paymentIntent.metadata,
                purchaseId: purchase.id,
                accessToken: purchase.accessToken,
            },
        });
        return {
            purchaseId: purchase.id,
            clientSecret: paymentIntent.client_secret,
            amount: content.price,
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
                contentItems: purchase.content.contentItems.map((item) => ({
                    id: item.id,
                    s3Key: item.s3Key,
                    s3Bucket: item.s3Bucket,
                    order: item.order,
                })),
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
            throw new common_1.NotFoundException('Purchase not found');
        }
        if (purchase.paymentIntentId !== paymentIntentId) {
            throw new common_1.BadRequestException('Payment intent mismatch');
        }
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            throw new common_1.BadRequestException('Payment not completed');
        }
        if (purchase.status === 'COMPLETED') {
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
        const creatorEarnings = purchase.amount * 0.85;
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
};
exports.BuyerService = BuyerService;
exports.BuyerService = BuyerService = BuyerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService])
], BuyerService);
//# sourceMappingURL=buyer.service.js.map