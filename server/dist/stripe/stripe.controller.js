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
let StripeController = StripeController_1 = class StripeController {
    constructor(stripeService, prisma) {
        this.stripeService = stripeService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(StripeController_1.name);
    }
    getConfig() {
        return {
            publishableKey: this.stripeService.getPublishableKey(),
        };
    }
    async handleWebhook(signature, request) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing stripe-signature header');
        }
        const rawBody = request.rawBody;
        if (!rawBody) {
            throw new common_1.BadRequestException('Missing request body');
        }
        let event;
        try {
            event = this.stripeService.constructWebhookEvent(rawBody, signature);
        }
        catch (error) {
            this.logger.error('Webhook signature verification failed:', error);
            throw new common_1.BadRequestException('Invalid signature');
        }
        this.logger.log(`Received webhook event: ${event.type}`);
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
        const purchase = await this.prisma.purchase.findUnique({
            where: { paymentIntentId: paymentIntent.id },
            include: {
                content: {
                    include: {
                        creator: true,
                    },
                },
            },
        });
        if (!purchase) {
            this.logger.warn(`Purchase not found for payment intent: ${paymentIntent.id}`);
            return;
        }
        if (purchase.status === 'COMPLETED') {
            this.logger.log(`Purchase ${purchase.id} already completed, skipping webhook processing`);
            return;
        }
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                status: 'COMPLETED',
                transactionId: paymentIntent.id,
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
        this.logger.log(`Purchase ${purchase.id} completed successfully`);
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
        this.logger.log(`Charge refunded: ${charge.id}`);
        const purchase = await this.prisma.purchase.findUnique({
            where: { paymentIntentId: charge.payment_intent },
            include: {
                content: {
                    include: {
                        creator: true,
                    },
                },
            },
        });
        if (!purchase) {
            this.logger.warn(`Purchase not found for charge: ${charge.id}`);
            return;
        }
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                status: 'REFUNDED',
            },
        });
        await this.prisma.content.update({
            where: { id: purchase.contentId },
            data: {
                purchaseCount: { decrement: 1 },
                totalRevenue: { decrement: purchase.amount },
            },
        });
        const creatorEarnings = purchase.basePrice
            ? purchase.basePrice * 0.90
            : purchase.amount * 0.85;
        await this.prisma.creatorProfile.update({
            where: { id: purchase.content.creatorId },
            data: {
                totalEarnings: { decrement: creatorEarnings },
                totalPurchases: { decrement: 1 },
            },
        });
        this.logger.log(`Purchase ${purchase.id} refunded successfully`);
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
        prisma_service_1.PrismaService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map