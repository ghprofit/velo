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
var CreatorsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const creators_service_1 = require("./creators.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const payout_eligible_guard_1 = require("../auth/guards/payout-eligible.guard");
const bank_account_dto_1 = require("./dto/bank-account.dto");
const request_payout_dto_1 = require("./dto/request-payout.dto");
let CreatorsController = CreatorsController_1 = class CreatorsController {
    constructor(creatorsService) {
        this.creatorsService = creatorsService;
        this.logger = new common_1.Logger(CreatorsController_1.name);
    }
    async initiateVerification(req) {
        this.logger.log(`Initiating verification for user: ${req.user.id}`);
        try {
            const result = await this.creatorsService.initiateVerification(req.user.id);
            return {
                success: true,
                message: 'Verification session created successfully',
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to initiate verification:', error);
            throw error;
        }
    }
    async getVerificationStatus(req) {
        this.logger.log(`Getting verification status for user: ${req.user.id}`);
        try {
            const status = await this.creatorsService.getMyVerificationStatus(req.user.id);
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            this.logger.error('Failed to get verification status:', error);
            throw error;
        }
    }
    async setupBankAccount(req, bankAccountDto) {
        this.logger.log(`Setting up bank account for user: ${req.user.id}`);
        try {
            const bankAccount = await this.creatorsService.setupBankAccount(req.user.id, bankAccountDto);
            return {
                success: true,
                message: 'Bank account setup completed successfully',
                data: bankAccount,
            };
        }
        catch (error) {
            this.logger.error('Failed to setup bank account:', error);
            throw error;
        }
    }
    async getBankAccount(req) {
        this.logger.log(`Getting bank account info for user: ${req.user.id}`);
        try {
            const bankAccount = await this.creatorsService.getBankAccount(req.user.id);
            return {
                success: true,
                data: bankAccount,
            };
        }
        catch (error) {
            this.logger.error('Failed to get bank account:', error);
            throw error;
        }
    }
    async requestPayout(req, requestPayoutDto) {
        this.logger.log(`Payout request from user: ${req.user.id}`);
        try {
            const result = await this.creatorsService.requestPayout(req.user.id, requestPayoutDto.amount);
            return {
                success: true,
                message: result.message,
                data: {
                    id: result.id,
                    requestedAmount: result.requestedAmount,
                    availableBalance: result.availableBalance,
                    currency: result.currency,
                    status: result.status,
                    createdAt: result.createdAt,
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to create payout request:', error);
            throw error;
        }
    }
    async getPayoutRequests(req) {
        this.logger.log(`Getting payout requests for user: ${req.user.id}`);
        try {
            const requests = await this.creatorsService.getPayoutRequests(req.user.id);
            return {
                success: true,
                data: requests,
            };
        }
        catch (error) {
            this.logger.error('Failed to get payout requests:', error);
            throw error;
        }
    }
    async getPayoutRequestById(req, requestId) {
        this.logger.log(`Getting payout request ${requestId} for user: ${req.user.id}`);
        try {
            const request = await this.creatorsService.getPayoutRequestById(req.user.id, requestId);
            return {
                success: true,
                data: request,
            };
        }
        catch (error) {
            this.logger.error('Failed to get payout request:', error);
            throw error;
        }
    }
    async getStripeOnboardingLink(req) {
        this.logger.log(`Getting Stripe onboarding link for user: ${req.user.id}`);
        try {
            const result = await this.creatorsService.getStripeOnboardingLink(req.user.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to get Stripe onboarding link:', error);
            throw error;
        }
    }
    async getStripeAccountStatus(req) {
        this.logger.log(`Getting Stripe account status for user: ${req.user.id}`);
        try {
            const result = await this.creatorsService.getStripeAccountStatus(req.user.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to get Stripe account status:', error);
            throw error;
        }
    }
};
exports.CreatorsController = CreatorsController;
__decorate([
    (0, common_1.Post)('verify/initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "initiateVerification", null);
__decorate([
    (0, common_1.Get)('verify/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getVerificationStatus", null);
__decorate([
    (0, common_1.Post)('payout/setup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bank_account_dto_1.SetupBankAccountDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "setupBankAccount", null);
__decorate([
    (0, common_1.Get)('payout/info'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getBankAccount", null);
__decorate([
    (0, common_1.Post)('payout/request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(payout_eligible_guard_1.PayoutEligibleGuard),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 3600000 } }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, request_payout_dto_1.RequestPayoutDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "requestPayout", null);
__decorate([
    (0, common_1.Get)('payout/requests'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getPayoutRequests", null);
__decorate([
    (0, common_1.Get)('payout/requests/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getPayoutRequestById", null);
__decorate([
    (0, common_1.Get)('payout/stripe-onboarding'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getStripeOnboardingLink", null);
__decorate([
    (0, common_1.Get)('payout/stripe-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getStripeAccountStatus", null);
exports.CreatorsController = CreatorsController = CreatorsController_1 = __decorate([
    (0, common_1.Controller)('creators'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [creators_service_1.CreatorsService])
], CreatorsController);
//# sourceMappingURL=creators.controller.js.map