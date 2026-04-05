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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getOverview(req, period) {
        const userId = req.user.id;
        const data = await this.analyticsService.getCreatorOverview(userId, period);
        return {
            success: true,
            data,
        };
    }
    async getTrends(req, period, metric) {
        const userId = req.user.id;
        const result = await this.analyticsService.getPerformanceTrends(userId, period, metric);
        return {
            success: true,
            data: result.data,
            metric: result.metric,
        };
    }
    async getContentPerformance(req, page, limit, search) {
        const userId = req.user.id;
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '10', 10);
        const data = await this.analyticsService.getContentPerformance(userId, {
            page: pageNum,
            limit: limitNum,
            search,
        });
        return {
            success: true,
            data,
        };
    }
    async getDemographics(req, period) {
        const userId = req.user.id;
        const data = await this.analyticsService.getDemographics(userId, period);
        return {
            success: true,
            data,
        };
    }
    async getGeographicDistribution(req, period) {
        const userId = req.user.id;
        const data = await this.analyticsService.getGeographicDistribution(userId, period);
        return {
            success: true,
            data,
        };
    }
    async getDeviceDistribution(req, period) {
        const userId = req.user.id;
        const data = await this.analyticsService.getDeviceDistribution(userId, period);
        return {
            success: true,
            data,
        };
    }
    async getBrowserDistribution(req, period) {
        const userId = req.user.id;
        const data = await this.analyticsService.getBrowserDistribution(userId, period);
        return {
            success: true,
            data,
        };
    }
    async recordView(contentId, ip, userAgent, referrer, body) {
        await this.analyticsService.recordContentView(contentId, {
            ipAddress: ip,
            userAgent,
            referrer,
            ...body,
        });
        return {
            success: true,
            message: 'View recorded',
        };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('metric')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTrends", null);
__decorate([
    (0, common_1.Get)('content-performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getContentPerformance", null);
__decorate([
    (0, common_1.Get)('demographics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDemographics", null);
__decorate([
    (0, common_1.Get)('demographics/geographic'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getGeographicDistribution", null);
__decorate([
    (0, common_1.Get)('demographics/devices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDeviceDistribution", null);
__decorate([
    (0, common_1.Get)('demographics/browsers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getBrowserDistribution", null);
__decorate([
    (0, common_1.Post)('view/:contentId'),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __param(3, (0, common_1.Headers)('referer')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "recordView", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map