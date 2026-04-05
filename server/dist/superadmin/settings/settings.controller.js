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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const settings_dto_1 = require("./dto/settings.dto");
const superadmin_guard_1 = require("../guards/superadmin.guard");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async initializeSettings() {
        await this.settingsService.initializeDefaultSettings();
        return { message: 'Settings initialized successfully' };
    }
    async getAllSettings(category) {
        return this.settingsService.getAllSettings(category);
    }
    async getPublicSettings() {
        return this.settingsService.getPublicSettings();
    }
    async getSetting(key) {
        return this.settingsService.getSetting(key);
    }
    async createSetting(dto, req) {
        const adminId = req.user.id;
        return this.settingsService.createSetting(dto, adminId);
    }
    async bulkUpdateSettings(dto, req) {
        const adminId = req.user.id;
        return this.settingsService.bulkUpdateSettings(dto, adminId);
    }
    async updateSetting(key, dto, req) {
        const adminId = req.user.id;
        return this.settingsService.updateSetting(key, dto, adminId);
    }
    async deleteSetting(key) {
        return this.settingsService.deleteSetting(key);
    }
    async resetToDefaults(req) {
        const adminId = req.user.id;
        return this.settingsService.resetToDefaults(adminId);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Post)('initialize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "initializeSettings", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAllSettings", null);
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getPublicSettings", null);
__decorate([
    (0, common_1.Get)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSetting", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.CreateSettingDto, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "createSetting", null);
__decorate([
    (0, common_1.Put)('bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.BulkUpdateSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "bulkUpdateSettings", null);
__decorate([
    (0, common_1.Put)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, settings_dto_1.UpdateSettingDto, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSetting", null);
__decorate([
    (0, common_1.Delete)(':key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "deleteSetting", null);
__decorate([
    (0, common_1.Post)('reset'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "resetToDefaults", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('superadmin/settings'),
    (0, common_1.UseGuards)(superadmin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map