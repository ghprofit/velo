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
exports.CreatorsController = void 0;
const common_1 = require("@nestjs/common");
const creators_service_1 = require("./creators.service");
const query_creators_dto_1 = require("./dto/query-creators.dto");
const update_creator_dto_1 = require("./dto/update-creator.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const superadmin_guard_1 = require("../guards/superadmin.guard");
let CreatorsController = class CreatorsController {
    constructor(creatorsService) {
        this.creatorsService = creatorsService;
    }
    async getCreators(query) {
        const result = await this.creatorsService.getCreators(query);
        return {
            success: true,
            ...result,
        };
    }
    async getCreatorStats() {
        const stats = await this.creatorsService.getCreatorStats();
        return {
            success: true,
            data: stats,
        };
    }
    async getCreatorById(id) {
        const creator = await this.creatorsService.getCreatorById(id);
        return {
            success: true,
            data: creator,
        };
    }
    async updateCreator(id, dto) {
        const creator = await this.creatorsService.updateCreator(id, dto);
        return {
            success: true,
            message: 'Creator updated successfully',
            data: creator,
        };
    }
    async addStrike(id, dto, req) {
        const creator = await this.creatorsService.addStrike(id, dto.reason, req.user.id);
        return {
            success: true,
            message: 'Strike added successfully',
            data: creator,
        };
    }
    async suspendCreator(id, dto, req) {
        const creator = await this.creatorsService.suspendCreator(id, dto.reason, req.user.id);
        return {
            success: true,
            message: 'Creator suspended successfully',
            data: creator,
        };
    }
    async reactivateCreator(id, req) {
        const creator = await this.creatorsService.reactivateCreator(id, req.user.id);
        return {
            success: true,
            message: 'Creator reactivated successfully',
            data: creator,
        };
    }
};
exports.CreatorsController = CreatorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_creators_dto_1.QueryCreatorsDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getCreators", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getCreatorStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getCreatorById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_creator_dto_1.UpdateCreatorDto]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "updateCreator", null);
__decorate([
    (0, common_1.Post)(':id/strike'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_creator_dto_1.AddStrikeDto, Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "addStrike", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_creator_dto_1.SuspendCreatorDto, Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "suspendCreator", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "reactivateCreator", null);
exports.CreatorsController = CreatorsController = __decorate([
    (0, common_1.Controller)('superadmin/creators'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, superadmin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [creators_service_1.CreatorsService])
], CreatorsController);
//# sourceMappingURL=creators.controller.js.map