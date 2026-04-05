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
var PaystackController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackController = void 0;
const common_1 = require("@nestjs/common");
const paystack_service_1 = require("./paystack.service");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
const config_1 = require("@nestjs/config");
let PaystackController = PaystackController_1 = class PaystackController {
    constructor(paystackService, prisma, emailService, notificationsService, config) {
        this.paystackService = paystackService;
        this.prisma = prisma;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.config = config;
        this.logger = new common_1.Logger(PaystackController_1.name);
    }
    test() {
        this.logger.log('Paystack test endpoint called');
        return {
            ok: true,
            message: 'Paystack webhook test endpoint is reachable',
        };
    }
    async handleWebhook(signature, request) {
        const webhookStartTime = Date.now();
        const rawBody = request.rawBody;
        if (!rawBody) {
            this.logger.error('No raw body found in webhook request');
            throw new common_1.BadRequestException('Invalid request body');
        }
        if (!signature) {
            this.logger.error('No x-paystack-signature header found');
            throw new common_1.BadRequestException('Missing signature header');
        }
        this.logger.log('Paystack webhook signature:', signature);
        try {
            if (!this.paystackService.verifyWebhookSignature(rawBody, signature)) {
                throw new common_1.UnauthorizedException('Invalid webhook signature');
            }
            this.logger.log('Paystack webhook signature validated successfully');
        }
        catch (err) {
            this.logger.error('Paystack webhook verification failed:', err);
            throw new common_1.UnauthorizedException('Webhook signature verification failed');
        }
        let event;
        try {
            event = JSON.parse(rawBody.toString());
        }
        catch (error) {
            this.logger.error('Failed to parse webhook payload:', error);
            throw new common_1.BadRequestException('Invalid webhook payload');
        }
        this.logger.log(`Paystack webhook received: ${event.event}`);
        try {
            switch (event.event) {
                case 'charge.success':
                    await this.handleChargeSuccess(event.data);
                    break;
                default:
                    this.logger.log(`Unhandled event type: ${event.event}`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing webhook ${event.event}:`, error);
        }
        const webhookDuration = Date.now() - webhookStartTime;
        this.logger.log(`Paystack webhook ${event.event} processed in ${webhookDuration}ms`);
        return { received: true };
    }
    async handleChargeSuccess(chargeData) {
        this.logger.log(`Paystack charge succeeded: ${chargeData.reference}`);
        const reference = chargeData.reference;
        try {
            const purchase = await this.prisma.purchase.findFirst({
                where: { paymentIntentId: reference },
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
                this.logger.warn(`Purchase not found for Paystack reference: ${reference}`);
                return;
            }
            if (purchase.status === 'COMPLETED') {
                this.logger.log(`Purchase ${purchase.id} already completed`);
                return;
            }
            await this.prisma.purchase.update({
                where: { id: purchase.id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });
            this.logger.log(`Purchase ${purchase.id} marked as completed`);
            if (purchase.buyerSession.email) {
                try {
                    const clientUrl = this.config.get('CLIENT_URL') || 'http://localhost:3000';
                    await this.emailService.sendPurchaseReceipt(purchase.buyerSession.email, {
                        buyer_email: purchase.buyerSession.email,
                        content_title: purchase.content.title,
                        amount: `$${purchase.amount.toFixed(2)}`,
                        date: new Date().toLocaleDateString(),
                        access_link: `${clientUrl}/c/${purchase.contentId}?accessToken=${purchase.accessToken}`,
                        transaction_id: purchase.paymentIntentId || '',
                    });
                    this.logger.log(`Confirmation email sent to ${purchase.buyerSession.email}`);
                }
                catch (emailError) {
                    this.logger.error('Failed to send confirmation email:', emailError);
                }
            }
            try {
                await this.notificationsService.createNotification({
                    userId: purchase.buyerSession.id,
                    type: create_notification_dto_1.NotificationType.PURCHASE_MADE,
                    title: 'Purchase Completed',
                    message: `Your purchase of "${purchase.content.title}" has been completed successfully.`,
                    metadata: {
                        purchaseId: purchase.id,
                        contentId: purchase.contentId,
                        amount: purchase.amount,
                    },
                });
            }
            catch (notificationError) {
                this.logger.error('Failed to create notification:', notificationError);
            }
            await this.prisma.content.update({
                where: { id: purchase.contentId },
                data: {
                    purchaseCount: {
                        increment: 1,
                    },
                },
            });
            this.logger.log(`Content ${purchase.contentId} purchase count updated`);
        }
        catch (error) {
            this.logger.error(`Error processing Paystack charge success for ${reference}:`, error);
            throw error;
        }
    }
};
exports.PaystackController = PaystackController;
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaystackController.prototype, "test", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('x-paystack-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaystackController.prototype, "handleWebhook", null);
exports.PaystackController = PaystackController = PaystackController_1 = __decorate([
    (0, common_1.Controller)('paystack'),
    __metadata("design:paramtypes", [paystack_service_1.PaystackService,
        prisma_service_1.PrismaService,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], PaystackController);
//# sourceMappingURL=paystack.controller.js.map