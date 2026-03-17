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
var PaystackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PaystackService = PaystackService_1 = class PaystackService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PaystackService_1.name);
        this.apiBase = 'https://api.paystack.co';
        this.secretKey = this.config.get('PAYSTACK_SECRET_KEY') || '';
        if (!this.secretKey) {
            this.logger.warn('PAYSTACK_SECRET_KEY is not configured; Paystack purchase flows will be disabled.');
        }
        else {
            this.logger.log('✓ Paystack initialized');
        }
    }
    isConfigured() {
        return !!this.secretKey;
    }
    getAuthHeaders() {
        if (!this.secretKey) {
            throw new common_1.BadRequestException('Paystack is not configured');
        }
        return {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
        };
    }
    async initializeTransaction(email, amount, callbackUrl, metadata = {}) {
        try {
            const url = `${this.apiBase}/transaction/initialize`;
            const body = {
                email,
                amount: Math.round(amount * 100),
                callback_url: callbackUrl,
                metadata,
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(body),
            });
            const json = (await response.json());
            if (!response.ok || !json.status) {
                const errorMessage = json.message || 'Failed to initialize Paystack payment';
                this.logger.error(`Paystack initialize error: ${errorMessage}`);
                throw new common_1.BadRequestException(errorMessage);
            }
            const { authorization_url, reference } = json.data;
            if (!authorization_url || !reference) {
                this.logger.error('Paystack initialize response missing auth url or reference', json);
                throw new common_1.BadRequestException('Failed to initialize Paystack payment');
            }
            return { authorizationUrl: authorization_url, reference };
        }
        catch (error) {
            this.logger.error('Paystack initialize transaction failed:', error?.message || error);
            throw new common_1.BadRequestException('Failed to initialize Paystack payment');
        }
    }
    async verifyTransaction(reference) {
        try {
            const url = `${this.apiBase}/transaction/verify/${encodeURIComponent(reference)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            const json = (await response.json());
            if (!response.ok || !json.status || !json.data) {
                const errorMessage = json.message || 'Failed to verify Paystack transaction';
                this.logger.error(`Paystack verify error: ${errorMessage}`);
                throw new common_1.BadRequestException(errorMessage);
            }
            const data = json.data;
            return {
                status: data.status,
                amount: data.amount / 100,
                currency: data.currency,
                paidAt: data.paid_at || new Date().toISOString(),
                customerEmail: data.customer?.email || '',
            };
        }
        catch (error) {
            this.logger.error('Paystack verify transaction failed:', error?.message || error);
            throw new common_1.BadRequestException('Failed to verify Paystack transaction');
        }
    }
};
exports.PaystackService = PaystackService;
exports.PaystackService = PaystackService = PaystackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaystackService);
//# sourceMappingURL=paystack.service.js.map