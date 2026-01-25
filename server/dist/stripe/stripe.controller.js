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
var StripeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
const config_1 = require("@nestjs/config");
let StripeController = StripeController_1 = class StripeController {
    constructor(stripeService, prisma, emailService, notificationsService, config) {
        this.stripeService = stripeService;
        this.prisma = prisma;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.config = config;
        this.logger = new common_1.Logger(StripeController_1.name);
    }
    getConfig() {
        return {
            publishableKey: this.stripeService.getPublishableKey(),
        };
    }
    async handleWebhook(signature, request) {
        const rawBody = request.rawBody;
        if (!rawBody) {
            this.logger.error('No raw body found in webhook request');
            throw new common_1.BadRequestException('Invalid request body');
        }
        if (!signature) {
            this.logger.error('No stripe-signature header found');
            throw new common_1.BadRequestException('Missing signature header');
        }
        let event;
        try {
            event = this.stripeService.constructWebhookEvent(rawBody, signature);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Webhook signature verification failed:', errorMessage);
            if (errorMessage?.includes('not configured')) {
                this.logger.error('CRITICAL: STRIPE_WEBHOOK_SECRET is not configured!');
            }
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        this.logger.log(`Webhook received: ${event.type}`);
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;
                case 'charge.refunded':
                    await this.handleChargeRefunded(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled event type: ${event.type}`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing webhook ${event.type}:`, error);
        }
        return { received: true };
    }
    async handlePaymentIntentSucceeded(paymentIntent) {
        this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
        const idempotencyKey = `webhook_${paymentIntent.id}_${Date.now()}`;
        let purchaseData = null;
        try {
            await this.prisma.$transaction(async (tx) => {
                let purchase = await tx.purchase.findUnique({
                    where: { paymentIntentId: paymentIntent.id },
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
                    this.logger.warn(`Purchase not found for payment intent: ${paymentIntent.id}`);
                    const { contentId, sessionId } = paymentIntent.metadata || {};
                    if (!contentId || !sessionId) {
                        this.logger.error(`Cannot create purchase from webhook - missing metadata. ContentId: ${contentId}, SessionId: ${sessionId}`);
                        return;
                    }
                    this.logger.log(`Attempting to create purchase from webhook for payment intent: ${paymentIntent.id}`);
                    try {
                        const [content, buyerSession] = await Promise.all([
                            tx.content.findUnique({
                                where: { id: contentId },
                                include: {
                                    creator: {
                                        include: { user: true },
                                    },
                                },
                            }),
                            tx.buyerSession.findUnique({ where: { id: sessionId } }),
                        ]);
                        if (!content || !buyerSession) {
                            this.logger.error(`Cannot create purchase - content or session not found. Content: ${!!content}, Session: ${!!buyerSession}`);
                            return;
                        }
                        if (!buyerSession.email) {
                            this.logger.warn(`INVOICE EMAIL ISSUE: No email found for buyerSession ${sessionId}. Invoice will NOT be sent! Payment Intent: ${paymentIntent.id}`);
                        }
                        const crypto = require('crypto');
                        const accessToken = crypto.randomBytes(32).toString('hex');
                        const amount = paymentIntent.amount / 100;
                        const basePrice = content.price;
                        purchase = await tx.purchase.create({
                            data: {
                                contentId,
                                buyerSessionId: sessionId,
                                amount,
                                basePrice,
                                currency: paymentIntent.currency.toUpperCase(),
                                paymentProvider: 'STRIPE',
                                paymentIntentId: paymentIntent.id,
                                status: 'COMPLETED',
                                transactionId: paymentIntent.id,
                                completedBy: 'WEBHOOK',
                                completedAt: new Date(),
                                webhookProcessedAt: new Date(),
                                completionIdempotencyKey: idempotencyKey,
                                accessToken,
                                purchaseFingerprint: buyerSession.fingerprint,
                                trustedFingerprints: buyerSession.fingerprint
                                    ? [buyerSession.fingerprint]
                                    : [],
                                purchaseIpAddress: buyerSession.ipAddress,
                            },
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
                        this.logger.log(`✅ Purchase created from webhook: ${purchase.id} for payment intent: ${paymentIntent.id}`);
                        await tx.content.update({
                            where: { id: contentId },
                            data: {
                                purchaseCount: { increment: 1 },
                                totalRevenue: { increment: amount },
                            },
                        });
                        const creatorEarnings = basePrice * 0.9;
                        const earningsPendingUntil = new Date();
                        earningsPendingUntil.setHours(earningsPendingUntil.getHours() + 24);
                        await tx.creatorProfile.update({
                            where: { id: content.creatorId },
                            data: {
                                totalEarnings: { increment: creatorEarnings },
                                pendingBalance: { increment: creatorEarnings },
                                totalPurchases: { increment: 1 },
                            },
                        });
                        purchaseData = {
                            id: purchase.id,
                            buyerEmail: buyerSession.email,
                            contentTitle: content.title,
                            contentId: content.id,
                            amount,
                            basePrice,
                            accessToken,
                            creatorEmail: content.creator.user.email,
                            creatorName: content.creator.displayName,
                            creatorEarnings,
                        };
                        this.logger.log(`Purchase ${purchase.id} created and confirmed by WEBHOOK FALLBACK with idempotency key ${idempotencyKey}`);
                        return;
                    }
                    catch (createError) {
                        this.logger.error(`Failed to create purchase from webhook:`, createError);
                        return;
                    }
                }
                if (purchase.status === 'COMPLETED') {
                    this.logger.log(`Purchase ${purchase.id} already completed by ${purchase.completedBy}`);
                    return;
                }
                await tx.purchase.update({
                    where: { id: purchase.id },
                    data: {
                        status: 'COMPLETED',
                        transactionId: paymentIntent.id,
                        completionIdempotencyKey: idempotencyKey,
                        completedBy: 'WEBHOOK',
                        completedAt: new Date(),
                        webhookProcessedAt: new Date(),
                    },
                });
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
                purchaseData = {
                    id: purchase.id,
                    buyerEmail: purchase.buyerSession?.email,
                    contentTitle: purchase.content.title,
                    contentId: purchase.content.id,
                    amount: purchase.amount,
                    basePrice: purchase.basePrice || purchase.content.price,
                    accessToken: purchase.accessToken,
                    creatorEmail: purchase.content.creator.user.email,
                    creatorName: purchase.content.creator.displayName,
                    creatorEarnings,
                };
                this.logger.log(`Purchase ${purchase.id} confirmed by WEBHOOK with idempotency key ${idempotencyKey}`);
            }, { maxWait: 5000, timeout: 10000 });
            if (purchaseData) {
                if (purchaseData.buyerEmail) {
                    try {
                        const clientUrl = this.config.get('CLIENT_URL') || 'http://localhost:3000';
                        this.logger.log(`[EMAIL] Sending purchase receipt to ${purchaseData.buyerEmail} for purchase ${purchaseData.id}`);
                        const emailResult = await this.emailService.sendPurchaseReceipt(purchaseData.buyerEmail, {
                            buyer_email: purchaseData.buyerEmail,
                            content_title: purchaseData.contentTitle,
                            amount: purchaseData.amount.toFixed(2),
                            date: new Date().toLocaleDateString(),
                            access_link: `${clientUrl}/c/${purchaseData.contentId}?token=${purchaseData.accessToken}`,
                            transaction_id: paymentIntent.id,
                        });
                        if (emailResult.success) {
                            this.logger.log(`[EMAIL] ✅ Purchase receipt sent successfully to ${purchaseData.buyerEmail}. MessageId: ${emailResult.messageId}`);
                        }
                        else {
                            this.logger.error(`[EMAIL] ❌ Failed to send purchase receipt to ${purchaseData.buyerEmail}: ${emailResult.error}`);
                        }
                    }
                    catch (error) {
                        this.logger.error(`[EMAIL] Exception while sending purchase receipt to ${purchaseData.buyerEmail}:`, error);
                    }
                }
                else {
                    this.logger.warn(`[EMAIL] ⚠️ No buyer email found for purchase ${purchaseData.id}. Invoice NOT sent!`);
                }
                try {
                    this.logger.log(`[EMAIL] Sending creator sale notification to ${purchaseData.creatorEmail} for purchase ${purchaseData.id}`);
                    const creatorEmailResult = await this.emailService.sendCreatorSaleNotification(purchaseData.creatorEmail, {
                        creator_name: purchaseData.creatorName,
                        content_title: purchaseData.contentTitle,
                        sale_amount: purchaseData.basePrice.toFixed(2),
                        creator_earnings: purchaseData.creatorEarnings.toFixed(2),
                        date: new Date().toLocaleDateString(),
                    });
                    if (creatorEmailResult.success) {
                        this.logger.log(`[EMAIL] ✅ Creator sale notification sent to ${purchaseData.creatorEmail}. MessageId: ${creatorEmailResult.messageId}`);
                    }
                    else {
                        this.logger.error(`[EMAIL] ❌ Failed to send creator sale notification to ${purchaseData.creatorEmail}: ${creatorEmailResult.error}`);
                    }
                }
                catch (error) {
                    this.logger.error(`[EMAIL] Exception while sending creator sale notification to ${purchaseData.creatorEmail}:`, error);
                }
                let buyerUser = null;
                try {
                    buyerUser = await this.prisma.user.findUnique({
                        where: { email: purchaseData.buyerEmail },
                    });
                }
                catch (error) {
                    this.logger.warn(`[NOTIFICATION] Could not find buyer user by email: ${purchaseData.buyerEmail}`);
                }
                if (buyerUser) {
                    try {
                        this.logger.log(`[NOTIFICATION] Creating purchase notification for buyer: ${buyerUser.id}`);
                        await this.notificationsService.createNotification({
                            userId: buyerUser.id,
                            type: create_notification_dto_1.NotificationType.PURCHASE_MADE,
                            title: 'Purchase Successful',
                            message: `You successfully purchased "${purchaseData.contentTitle}" for $${purchaseData.amount.toFixed(2)}`,
                            metadata: {
                                purchaseId: purchaseData.id,
                                contentId: purchaseData.contentId,
                                amount: purchaseData.amount,
                            },
                        });
                        this.logger.log(`[NOTIFICATION] ✅ Buyer notification created for user: ${buyerUser.id}`);
                    }
                    catch (error) {
                        this.logger.error(`[NOTIFICATION] ❌ Failed to create buyer notification:`, error);
                    }
                }
                else {
                    this.logger.log(`[NOTIFICATION] ℹ️ Buyer is not a registered user (anonymous purchase with email: ${purchaseData.buyerEmail})`);
                }
                try {
                    const creatorProfile = await this.prisma.creatorProfile.findFirst({
                        where: { displayName: purchaseData.creatorName },
                        include: { user: true },
                    });
                    if (creatorProfile?.user) {
                        this.logger.log(`[NOTIFICATION] Creating sale notification for creator: ${creatorProfile.user.id}`);
                        await this.notificationsService.createNotification({
                            userId: creatorProfile.user.id,
                            type: create_notification_dto_1.NotificationType.PURCHASE_MADE,
                            title: 'Your Content Was Purchased',
                            message: `Your content "${purchaseData.contentTitle}" was purchased! You earned $${purchaseData.creatorEarnings.toFixed(2)}`,
                            metadata: {
                                purchaseId: purchaseData.id,
                                contentId: purchaseData.contentId,
                                earnings: purchaseData.creatorEarnings,
                            },
                        });
                        this.logger.log(`[NOTIFICATION] ✅ Creator notification created for user: ${creatorProfile.user.id}`);
                    }
                }
                catch (error) {
                    this.logger.error(`[NOTIFICATION] ❌ Failed to create creator notification:`, error);
                }
                try {
                    const adminUsers = await this.prisma.user.findMany({
                        where: {
                            role: 'ADMIN',
                        },
                        select: { id: true },
                    });
                    if (adminUsers.length > 0) {
                        this.logger.log(`[NOTIFICATION] Creating purchase alert for ${adminUsers.length} admin user(s)`);
                        for (const adminUser of adminUsers) {
                            try {
                                await this.notificationsService.createNotification({
                                    userId: adminUser.id,
                                    type: create_notification_dto_1.NotificationType.PURCHASE_MADE,
                                    title: 'New Purchase on Platform',
                                    message: `A new purchase was made: "${purchaseData.contentTitle}" by ${purchaseData.creatorName} for $${purchaseData.amount.toFixed(2)}`,
                                    metadata: {
                                        purchaseId: purchaseData.id,
                                        contentId: purchaseData.contentId,
                                        creatorName: purchaseData.creatorName,
                                        amount: purchaseData.amount,
                                    },
                                });
                                this.logger.log(`[NOTIFICATION] ✅ Admin notification created for admin: ${adminUser.id}`);
                            }
                            catch (adminNotifError) {
                                this.logger.error(`[NOTIFICATION] ❌ Failed to create notification for admin ${adminUser.id}:`, adminNotifError);
                            }
                        }
                    }
                    else {
                        this.logger.warn(`[NOTIFICATION] ⚠️ No admin users found to notify about purchase`);
                    }
                }
                catch (error) {
                    this.logger.error(`[NOTIFICATION] ❌ Failed to create admin notifications:`, error);
                }
            }
            else {
                this.logger.warn(`[EMAIL] No purchase data available for email notifications`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process payment_intent.succeeded webhook:`, error);
            throw error;
        }
    }
    async handlePaymentIntentFailed(paymentIntent) {
        this.logger.log(`Payment failed: ${paymentIntent.id}`);
        const purchase = await this.prisma.purchase.findUnique({
            where: { paymentIntentId: paymentIntent.id },
        });
        if (!purchase) {
            this.logger.warn(`Purchase not found for payment intent: ${paymentIntent.id}`);
            return;
        }
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                status: 'FAILED',
            },
        });
        this.logger.log(`Purchase ${purchase.id} marked as failed`);
    }
    async handleChargeRefunded(charge) {
        this.logger.log(`Processing refund for charge: ${charge.id}`);
        const refundAmount = (charge.amount_refunded || 0) / 100;
        if (refundAmount <= 0) {
            this.logger.warn(`Invalid refund amount: ${refundAmount}`);
            return;
        }
        try {
            await this.prisma.$transaction(async (tx) => {
                const purchase = await tx.purchase.findUnique({
                    where: { paymentIntentId: charge.payment_intent },
                    include: {
                        content: {
                            include: { creator: true },
                        },
                    },
                });
                if (!purchase) {
                    this.logger.warn(`Purchase not found for charge: ${charge.payment_intent}`);
                    return;
                }
                const previouslyRefunded = purchase.refundedAmount || 0;
                const totalRefunded = previouslyRefunded + refundAmount;
                if (totalRefunded > purchase.amount * 1.01) {
                    this.logger.error(`Refund amount ${totalRefunded} exceeds purchase amount ${purchase.amount}`);
                    return;
                }
                const isFullRefund = totalRefunded >= purchase.amount * 0.99;
                await tx.purchase.update({
                    where: { id: purchase.id },
                    data: {
                        status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
                        refundedAmount: totalRefunded,
                        isFullyRefunded: isFullRefund,
                        isPartiallyRefunded: !isFullRefund && totalRefunded > 0,
                        refundedAt: purchase.refundedAt || new Date(),
                    },
                });
                if (isFullRefund && purchase.status === 'COMPLETED') {
                    await tx.content.update({
                        where: { id: purchase.contentId },
                        data: {
                            purchaseCount: { decrement: 1 },
                            totalRevenue: { decrement: purchase.amount },
                        },
                    });
                    const creatorEarnings = purchase.basePrice
                        ? purchase.basePrice * 0.9
                        : purchase.amount * 0.85;
                    const creator = await tx.creatorProfile.findUnique({
                        where: { id: purchase.content.creatorId },
                        select: {
                            pendingBalance: true,
                            availableBalance: true,
                        },
                    });
                    const earningsReleased = purchase.earningsReleased || false;
                    if (earningsReleased) {
                        await tx.creatorProfile.update({
                            where: { id: purchase.content.creatorId },
                            data: {
                                totalEarnings: { decrement: creatorEarnings },
                                availableBalance: { decrement: creatorEarnings },
                                totalPurchases: { decrement: 1 },
                            },
                        });
                        this.logger.log(`Refund deducted from available balance for purchase ${purchase.id}`);
                    }
                    else {
                        await tx.creatorProfile.update({
                            where: { id: purchase.content.creatorId },
                            data: {
                                totalEarnings: { decrement: creatorEarnings },
                                pendingBalance: { decrement: creatorEarnings },
                                totalPurchases: { decrement: 1 },
                            },
                        });
                        this.logger.log(`Refund deducted from pending balance for purchase ${purchase.id}`);
                    }
                    await tx.purchase.update({
                        where: { id: purchase.id },
                        data: {
                            earningsReleased: false,
                            earningsPendingUntil: null,
                        },
                    });
                    this.logger.log(`Full refund processed for purchase ${purchase.id}`);
                }
                else {
                    this.logger.log(`Partial refund (${refundAmount}) processed for purchase ${purchase.id}`);
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to process refund:', error);
            throw error;
        }
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StripeController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "handleWebhook", null);
exports.StripeController = StripeController = StripeController_1 = __decorate([
    (0, common_1.Controller)('stripe'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        prisma_service_1.PrismaService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map