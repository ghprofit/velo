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
exports.SuperadminController = void 0;
const common_1 = require("@nestjs/common");
const superadmin_service_1 = require("./superadmin.service");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const update_admin_dto_1 = require("./dto/update-admin.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const superadmin_guard_1 = require("./guards/superadmin.guard");
let SuperadminController = class SuperadminController {
    constructor(superadminService) {
        this.superadminService = superadminService;
    }
    async getAllAdmins(search, role) {
        const admins = await this.superadminService.getAllAdmins(search, role);
        return {
            success: true,
            data: admins,
        };
    }
    async getAdminById(id) {
        const admin = await this.superadminService.getAdminById(id);
        return {
            success: true,
            data: admin,
        };
    }
    async createAdmin(dto) {
        const admin = await this.superadminService.createAdmin(dto);
        return {
            success: true,
            message: 'Administrator created successfully',
            data: admin,
        };
    }
    async updateAdmin(id, dto) {
        const admin = await this.superadminService.updateAdmin(id, dto);
        return {
            success: true,
            message: 'Administrator updated successfully',
            data: admin,
        };
    }
    async deleteAdmin(id) {
        await this.superadminService.deleteAdmin(id);
        return {
            success: true,
            message: 'Administrator deleted successfully',
        };
    }
    async forcePasswordReset(id) {
        await this.superadminService.forcePasswordReset(id);
        return {
            success: true,
            message: 'Password reset has been forced',
        };
    }
    async getAdminActivity(id) {
        const activity = await this.superadminService.getAdminActivityLog(id);
        return {
            success: true,
            data: activity,
        };
    }
};
exports.SuperadminController = SuperadminController;
__decorate([
    (0, common_1.Get)('admins'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "getAllAdmins", null);
__decorate([
    (0, common_1.Get)('admins/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "getAdminById", null);
__decorate([
    (0, common_1.Post)('admins'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Put)('admins/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_admin_dto_1.UpdateAdminDto]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Delete)('admins/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "deleteAdmin", null);
__decorate([
    (0, common_1.Post)('admins/:id/force-password-reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "forcePasswordReset", null);
__decorate([
    (0, common_1.Get)('admins/:id/activity'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminController.prototype, "getAdminActivity", null);
exports.SuperadminController = SuperadminController = __decorate([
    (0, common_1.Controller)('superadmin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, superadmin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [superadmin_service_1.SuperadminService])
], SuperadminController);
//# sourceMappingURL=superadmin.controller.js.map