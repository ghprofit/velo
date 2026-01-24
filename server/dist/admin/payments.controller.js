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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const admin_role_guard_1 = require("../auth/guards/admin-role.guard");
const admin_roles_decorator_1 = require("../auth/decorators/admin-roles.decorator");
const payments_dto_1 = require("./dto/payments.dto");
const approve_payout_request_dto_1 = require("./dto/approve-payout-request.dto");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async getPaymentStats() {
        return this.paymentsService.getPaymentStats();
    }
    async getTransactions(query) {
        return this.paymentsService.getTransactions(query);
    }
    async getTransactionById(id) {
        return this.paymentsService.getTransactionById(id);
    }
    async getPayouts(query) {
        return this.paymentsService.getPayouts(query);
    }
    async processPayout(body) {
        return this.paymentsService.processPayout(body.payoutId);
    }
    async getRevenueChart(period) {
        return this.paymentsService.getRevenueChart(period || 'monthly');
    }
    async getPayoutRequests(status, creatorId, page, limit) {
        return this.paymentsService.getPayoutRequests({ status, creatorId, page, limit });
    }
    async getPayoutRequestDetails(id) {
        return this.paymentsService.getPayoutRequestDetails(id);
    }
    async approvePayoutRequest(req, dto) {
        return this.paymentsService.approvePayoutRequest(dto.requestId, req.user.id, dto.reviewNotes);
    }
    async rejectPayoutRequest(req, dto) {
        return this.paymentsService.rejectPayoutRequest(dto.requestId, req.user.id, dto.reviewNotes);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStats", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.QueryPaymentsDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransactionById", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.QueryPayoutsDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayouts", null);
__decorate([
    (0, common_1.Post)('payouts/process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.ProcessPayoutDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processPayout", null);
__decorate([
    (0, common_1.Get)('revenue-chart'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getRevenueChart", null);
__decorate([
    (0, common_1.Get)('payout-requests'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('creatorId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayoutRequests", null);
__decorate([
    (0, common_1.Get)('payout-requests/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayoutRequestDetails", null);
__decorate([
    (0, common_1.Post)('payout-requests/approve'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, approve_payout_request_dto_1.ApprovePayoutRequestDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "approvePayoutRequest", null);
__decorate([
    (0, common_1.Post)('payout-requests/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, approve_payout_request_dto_1.RejectPayoutRequestDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "rejectPayoutRequest", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('admin/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard, admin_role_guard_1.AdminRoleGuard),
    (0, admin_roles_decorator_1.AdminRoles)('FINANCIAL_ADMIN'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map