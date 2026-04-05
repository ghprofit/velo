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
exports.UpdateAdminDto = exports.PermissionsDto = exports.AdminStatusDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_admin_dto_1 = require("./create-admin.dto");
var AdminStatusDto;
(function (AdminStatusDto) {
    AdminStatusDto["ACTIVE"] = "ACTIVE";
    AdminStatusDto["SUSPENDED"] = "SUSPENDED";
    AdminStatusDto["INVITED"] = "INVITED";
})(AdminStatusDto || (exports.AdminStatusDto = AdminStatusDto = {}));
class PermissionsDto {
}
exports.PermissionsDto = PermissionsDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "dashboard", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "creatorManagement", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "contentReview", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "financialReports", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "systemSettings", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PermissionsDto.prototype, "supportTickets", void 0);
class UpdateAdminDto {
}
exports.UpdateAdminDto = UpdateAdminDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(create_admin_dto_1.AdminRoleDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AdminStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAdminDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAdminDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PermissionsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", PermissionsDto)
], UpdateAdminDto.prototype, "permissions", void 0);
//# sourceMappingURL=update-admin.dto.js.map