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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const content_service_1 = require("./content.service");
const query_content_dto_1 = require("./dto/query-content.dto");
const update_content_dto_1 = require("./dto/update-content.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const superadmin_guard_1 = require("../guards/superadmin.guard");
let ContentController = class ContentController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    async getContent(query) {
        const result = await this.contentService.getContent(query);
        return {
            success: true,
            ...result,
        };
    }
    async getContentStats() {
        const stats = await this.contentService.getContentStats();
        return {
            success: true,
            data: stats,
        };
    }
    async getContentById(id) {
        const content = await this.contentService.getContentById(id);
        return {
            success: true,
            data: content,
        };
    }
    async updateContent(id, dto) {
        const content = await this.contentService.updateContent(id, dto);
        return {
            success: true,
            message: 'Content updated successfully',
            data: content,
        };
    }
    async reviewContent(id, dto, req) {
        const content = await this.contentService.reviewContent(id, dto, req.user.id);
        return {
            success: true,
            message: `Content ${dto.decision.toLowerCase()} successfully`,
            data: content,
        };
    }
    async removeContent(id, dto, req) {
        const content = await this.contentService.removeContent(id, dto, req.user.id);
        return {
            success: true,
            message: 'Content removed successfully',
            data: content,
        };
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_content_dto_1.QueryContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getContent", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getContentStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getContentById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_content_dto_1.UpdateContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_content_dto_1.ReviewContentDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "reviewContent", null);
__decorate([
    (0, common_1.Post)(':id/remove'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_content_dto_1.RemoveContentDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "removeContent", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)('superadmin/content'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, superadmin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map