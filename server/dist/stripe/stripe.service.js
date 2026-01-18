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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = StripeService_1 = class StripeService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(StripeService_1.name);
        const stripeSecretKey = this.config.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            this.logger.error('STRIPE_SECRET_KEY is not configured');
            throw new Error('STRIPE_SECRET_KEY is required');
        }
        this.stripe = new stripe_1.default(stripeSecretKey, {
            apiVersion: '2025-12-15.clover',
            timeout: 30000,
            maxNetworkRetries: 2,
        });
        this.logger.log('✓ Stripe SDK initialized with 30s timeout and 2 retries');
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            this.logger.error('⚠️  CRITICAL: STRIPE_WEBHOOK_SECRET is not configured!');
            this.logger.error('⚠️  Webhook signature verification will FAIL!');
            this.logger.error('⚠️  This is a SECURITY VULNERABILITY!');
        }
        else if (!webhookSecret.startsWith('whsec_')) {
            this.logger.warn('STRIPE_WEBHOOK_SECRET format may be invalid (should start with "whsec_")');
        }
        else {
            this.logger.log('✓ STRIPE_WEBHOOK_SECRET configured correctly');
        }
    }
    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            this.logger.log(`Payment intent created: ${paymentIntent.id}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error('Failed to create payment intent:', error);
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async retrievePaymentIntent(paymentIntentId) {
        try {
            return await this.stripe.paymentIntents.retrieve(paymentIntentId);
        }
        catch (error) {
            this.logger.error(`Failed to retrieve payment intent ${paymentIntentId}:`, error);
            throw new common_1.BadRequestException('Failed to retrieve payment intent');
        }
    }
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const params = {};
            if (paymentMethodId) {
                params.payment_method = paymentMethodId;
            }
            return await this.stripe.paymentIntents.confirm(paymentIntentId, params);
        }
        catch (error) {
            this.logger.error(`Failed to confirm payment intent ${paymentIntentId}:`, error);
            throw new common_1.BadRequestException('Failed to confirm payment');
        }
    }
    async cancelPaymentIntent(paymentIntentId) {
        try {
            return await this.stripe.paymentIntents.cancel(paymentIntentId);
        }
        catch (error) {
            this.logger.error(`Failed to cancel payment intent ${paymentIntentId}:`, error);
            throw new common_1.BadRequestException('Failed to cancel payment');
        }
    }
    async createRefund(paymentIntentId, amount, reason) {
        try {
            const params = {
                payment_intent: paymentIntentId,
            };
            if (amount) {
                params.amount = Math.round(amount * 100);
            }
            if (reason) {
                params.reason = reason;
            }
            const refund = await this.stripe.refunds.create(params);
            this.logger.log(`Refund created: ${refund.id} for payment intent ${paymentIntentId}`);
            return refund;
        }
        catch (error) {
            this.logger.error(`Failed to create refund for ${paymentIntentId}:`, error);
            throw new common_1.BadRequestException('Failed to create refund');
        }
    }
    constructWebhookEvent(payload, signature) {
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            this.logger.error('STRIPE_WEBHOOK_SECRET is not configured');
            throw new Error('STRIPE_WEBHOOK_SECRET is required');
        }
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (error) {
            this.logger.error('Webhook signature verification failed:', error);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
    }
    getPublishableKey() {
        const publishableKey = this.config.get('STRIPE_PUBLISHABLE_KEY');
        if (!publishableKey) {
            this.logger.error('STRIPE_PUBLISHABLE_KEY is not configured');
            throw new Error('STRIPE_PUBLISHABLE_KEY is required');
        }
        return publishableKey;
    }
    async createCustomer(email, metadata = {}) {
        try {
            return await this.stripe.customers.create({
                email,
                metadata,
            });
        }
        catch (error) {
            this.logger.error('Failed to create customer:', error);
            throw new common_1.BadRequestException('Failed to create customer');
        }
    }
    getStripeInstance() {
        return this.stripe;
    }
    async createConnectAccount(email, metadata = {}) {
        try {
            const account = await this.stripe.accounts.create({
                type: 'express',
                email,
                capabilities: {
                    card_payments: { requested: false },
                    transfers: { requested: true },
                },
                metadata,
            });
            this.logger.log(`Connect account created: ${account.id} for ${email}`);
            return account;
        }
        catch (error) {
            this.logger.error('Failed to create Connect account:', error);
            throw new common_1.BadRequestException('Failed to create payout account');
        }
    }
    async createAccountLink(accountId, refreshUrl, returnUrl) {
        try {
            return await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: refreshUrl,
                return_url: returnUrl,
                type: 'account_onboarding',
            });
        }
        catch (error) {
            this.logger.error('Failed to create account link:', error);
            throw new common_1.BadRequestException('Failed to create account link');
        }
    }
    async getConnectAccount(accountId) {
        try {
            return await this.stripe.accounts.retrieve(accountId);
        }
        catch (error) {
            this.logger.error(`Failed to retrieve account ${accountId}:`, error);
            throw new common_1.BadRequestException('Failed to retrieve account');
        }
    }
    async createTransfer(amount, currency, destination, metadata = {}) {
        try {
            const transfer = await this.stripe.transfers.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                destination,
                metadata,
            });
            this.logger.log(`Transfer created: ${transfer.id} for ${amount} ${currency} to ${destination}`);
            return transfer;
        }
        catch (error) {
            this.logger.error('Failed to create transfer:', error);
            throw new common_1.BadRequestException('Failed to create transfer');
        }
    }
    async createPayout(amount, currency, stripeAccountId, metadata = {}) {
        try {
            const payout = await this.stripe.payouts.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                metadata,
            }, {
                stripeAccount: stripeAccountId,
            });
            this.logger.log(`Payout created: ${payout.id} for ${amount} ${currency} on account ${stripeAccountId}`);
            return payout;
        }
        catch (error) {
            this.logger.error('Failed to create payout:', error);
            throw new common_1.BadRequestException('Failed to create payout');
        }
    }
    async retrieveTransfer(transferId) {
        try {
            return await this.stripe.transfers.retrieve(transferId);
        }
        catch (error) {
            this.logger.error(`Failed to retrieve transfer ${transferId}:`, error);
            throw new common_1.BadRequestException('Failed to retrieve transfer');
        }
    }
    async addExternalBankAccount(accountId, bankAccountToken) {
        try {
            const bankAccount = await this.stripe.accounts.createExternalAccount(accountId, {
                external_account: bankAccountToken,
            });
            this.logger.log(`Bank account added to Connect account: ${accountId}`);
            return bankAccount;
        }
        catch (error) {
            this.logger.error('Failed to add bank account:', error);
            throw new common_1.BadRequestException('Failed to add bank account');
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map