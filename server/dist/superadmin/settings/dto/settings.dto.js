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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkUpdateSettingsDto = exports.CreateSettingDto = exports.UpdateSettingDto = exports.SettingCategory = void 0;
const class_validator_1 = require("class-validator");
var SettingCategory;
(function (SettingCategory) {
    SettingCategory["GENERAL"] = "general";
    SettingCategory["PAYMENTS"] = "payments";
    SettingCategory["CONTENT"] = "content";
    SettingCategory["SECURITY"] = "security";
})(SettingCategory || (exports.SettingCategory = SettingCategory = {}));
class UpdateSettingDto {
}
exports.UpdateSettingDto = UpdateSettingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSettingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingDto.prototype, "isPublic", void 0);
class CreateSettingDto {
}
exports.CreateSettingDto = CreateSettingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SettingCategory),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSettingDto.prototype, "isPublic", void 0);
class BulkUpdateSettingsDto {
}
exports.BulkUpdateSettingsDto = BulkUpdateSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkUpdateSettingsDto.prototype, "platformName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkUpdateSettingsDto.prototype, "platformDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkUpdateSettingsDto.prototype, "platformFeePercentage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkUpdateSettingsDto.prototype, "minPayoutAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkUpdateSettingsDto.prototype, "maxContentSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkUpdateSettingsDto.prototype, "allowedContentTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkUpdateSettingsDto.prototype, "requireEmailVerification", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkUpdateSettingsDto.prototype, "requireKYC", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkUpdateSettingsDto.prototype, "maintenanceMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkUpdateSettingsDto.prototype, "supportEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkUpdateSettingsDto.prototype, "maxLoginAttempts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkUpdateSettingsDto.prototype, "sessionTimeout", void 0);
//# sourceMappingURL=settings.dto.js.map