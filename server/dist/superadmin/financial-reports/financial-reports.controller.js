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
exports.FinancialReportsController = void 0;
const common_1 = require("@nestjs/common");
const financial_reports_service_1 = require("./financial-reports.service");
const query_financial_reports_dto_1 = require("./dto/query-financial-reports.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const superadmin_guard_1 = require("../guards/superadmin.guard");
let FinancialReportsController = class FinancialReportsController {
    constructor(financialReportsService) {
        this.financialReportsService = financialReportsService;
    }
    async getFinancialOverview(query) {
        return this.financialReportsService.getFinancialOverview(query);
    }
    async getRevenueReport(query) {
        return this.financialReportsService.getRevenueReport(query);
    }
    async getPayoutReport(query) {
        return this.financialReportsService.getPayoutReport(query);
    }
    async getRevenueAnalytics(query) {
        return this.financialReportsService.getRevenueAnalytics(query);
    }
    async getPayoutStats() {
        return this.financialReportsService.getPayoutStats();
    }
    async getCreatorEarnings(query) {
        return this.financialReportsService.getCreatorEarnings(query);
    }
};
exports.FinancialReportsController = FinancialReportsController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_financial_reports_dto_1.QueryFinancialReportsDto]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getFinancialOverview", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_financial_reports_dto_1.QueryFinancialReportsDto]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getRevenueReport", null);
__decorate([
    (0, common_1.Get)('payouts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_financial_reports_dto_1.QueryFinancialReportsDto]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getPayoutReport", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_financial_reports_dto_1.QueryFinancialReportsDto]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getRevenueAnalytics", null);
__decorate([
    (0, common_1.Get)('payout-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getPayoutStats", null);
__decorate([
    (0, common_1.Get)('creator-earnings'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_financial_reports_dto_1.QueryFinancialReportsDto]),
    __metadata("design:returntype", Promise)
], FinancialReportsController.prototype, "getCreatorEarnings", null);
exports.FinancialReportsController = FinancialReportsController = __decorate([
    (0, common_1.Controller)('superadmin/financial-reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, superadmin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [financial_reports_service_1.FinancialReportsService])
], FinancialReportsController);
//# sourceMappingURL=financial-reports.controller.js.map