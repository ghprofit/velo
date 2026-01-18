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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getCreatorPerformance(limit, sortBy) {
        return this.reportsService.getCreatorPerformance(limit || 10, sortBy || 'revenue');
    }
    async getAnalyticsOverview() {
        return this.reportsService.getAnalyticsOverview();
    }
    async getRevenueTrends(period) {
        return this.reportsService.getRevenueTrends(period || 'MONTHLY');
    }
    async getUserGrowth(userType) {
        return this.reportsService.getUserGrowth(userType || 'CREATORS');
    }
    async getContentPerformance() {
        return this.reportsService.getContentPerformance();
    }
    async getGeographicDistribution(limit) {
        return this.reportsService.getGeographicDistribution(limit || 10);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('creator-performance'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCreatorPerformance", null);
__decorate([
    (0, common_1.Get)('analytics-overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAnalyticsOverview", null);
__decorate([
    (0, common_1.Get)('revenue-trends'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getRevenueTrends", null);
__decorate([
    (0, common_1.Get)('user-growth'),
    __param(0, (0, common_1.Query)('userType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserGrowth", null);
__decorate([
    (0, common_1.Get)('content-performance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getContentPerformance", null);
__decorate([
    (0, common_1.Get)('geographic-distribution'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getGeographicDistribution", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('admin/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map