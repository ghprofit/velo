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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerController = void 0;
const common_1 = require("@nestjs/common");
const buyer_service_1 = require("./buyer.service");
const create_session_dto_1 = require("./dto/create-session.dto");
const create_purchase_dto_1 = require("./dto/create-purchase.dto");
const verify_access_dto_1 = require("./dto/verify-access.dto");
const confirm_purchase_dto_1 = require("./dto/confirm-purchase.dto");
const check_access_eligibility_dto_1 = require("./dto/check-access-eligibility.dto");
const request_device_verification_dto_1 = require("./dto/request-device-verification.dto");
const verify_device_code_dto_1 = require("./dto/verify-device-code.dto");
let BuyerController = class BuyerController {
    constructor(buyerService) {
        this.buyerService = buyerService;
    }
    async createSession(dto, ipAddress, req) {
        const userAgent = req.headers['user-agent'];
        return this.buyerService.createOrGetSession(dto, ipAddress, userAgent);
    }
    async getContentDetails(id) {
        return this.buyerService.getContentDetails(id);
    }
    async createPurchase(dto, ipAddress) {
        return this.buyerService.createPurchase(dto, ipAddress);
    }
    async verifyPurchase(id) {
        return this.buyerService.verifyPurchase(id);
    }
    async getContentAccess(dto, ipAddress) {
        return this.buyerService.getContentAccess(dto.accessToken, dto.fingerprint, ipAddress);
    }
    async getSessionPurchases(sessionToken) {
        return this.buyerService.getSessionPurchases(sessionToken);
    }
    async confirmPurchase(dto) {
        return this.buyerService.confirmPurchase(dto.purchaseId, dto.paymentIntentId);
    }
    async checkAccessEligibility(dto) {
        return this.buyerService.checkAccessEligibility(dto.accessToken, dto.fingerprint);
    }
    async requestDeviceVerification(dto) {
        return this.buyerService.requestDeviceVerification(dto.accessToken, dto.fingerprint, dto.email);
    }
    async verifyDeviceCode(dto) {
        return this.buyerService.verifyDeviceCode(dto.accessToken, dto.fingerprint, dto.verificationCode);
    }
};
exports.BuyerController = BuyerController;
__decorate([
    (0, common_1.Post)('session'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_session_dto_1.CreateSessionDto, String, Object]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('content/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "getContentDetails", null);
__decorate([
    (0, common_1.Post)('purchase'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchase_dto_1.CreatePurchaseDto, String]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "createPurchase", null);
__decorate([
    (0, common_1.Get)('purchase/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "verifyPurchase", null);
__decorate([
    (0, common_1.Post)('access'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_access_dto_1.VerifyAccessDto, String]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "getContentAccess", null);
__decorate([
    (0, common_1.Get)('session/:sessionToken/purchases'),
    __param(0, (0, common_1.Param)('sessionToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "getSessionPurchases", null);
__decorate([
    (0, common_1.Post)('purchase/confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_purchase_dto_1.ConfirmPurchaseDto]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "confirmPurchase", null);
__decorate([
    (0, common_1.Post)('access/check-eligibility'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_access_eligibility_dto_1.CheckAccessEligibilityDto]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "checkAccessEligibility", null);
__decorate([
    (0, common_1.Post)('access/request-device-verification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_device_verification_dto_1.RequestDeviceVerificationDto]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "requestDeviceVerification", null);
__decorate([
    (0, common_1.Post)('access/verify-device'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_device_code_dto_1.VerifyDeviceCodeDto]),
    __metadata("design:returntype", Promise)
], BuyerController.prototype, "verifyDeviceCode", null);
exports.BuyerController = BuyerController = __decorate([
    (0, common_1.Controller)('buyer'),
    __metadata("design:paramtypes", [buyer_service_1.BuyerService])
], BuyerController);
//# sourceMappingURL=buyer.controller.js.map