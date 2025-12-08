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
exports.SendToMultipleUsersDto = exports.BroadcastNotificationDto = exports.TargetRole = void 0;
const class_validator_1 = require("class-validator");
const create_notification_dto_1 = require("./create-notification.dto");
var TargetRole;
(function (TargetRole) {
    TargetRole["CREATOR"] = "CREATOR";
    TargetRole["ADMIN"] = "ADMIN";
    TargetRole["SUPPORT"] = "SUPPORT";
    TargetRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    TargetRole["ALL"] = "ALL";
})(TargetRole || (exports.TargetRole = TargetRole = {}));
class BroadcastNotificationDto {
}
exports.BroadcastNotificationDto = BroadcastNotificationDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(TargetRole, { each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], BroadcastNotificationDto.prototype, "targetRoles", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(create_notification_dto_1.NotificationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastNotificationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], BroadcastNotificationDto.prototype, "metadata", void 0);
class SendToMultipleUsersDto {
}
exports.SendToMultipleUsersDto = SendToMultipleUsersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], SendToMultipleUsersDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(create_notification_dto_1.NotificationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendToMultipleUsersDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendToMultipleUsersDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendToMultipleUsersDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendToMultipleUsersDto.prototype, "metadata", void 0);
//# sourceMappingURL=broadcast-notification.dto.js.map