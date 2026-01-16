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
exports.CreateNotificationDto = exports.NotificationType = void 0;
const class_validator_1 = require("class-validator");
var NotificationType;
(function (NotificationType) {
    NotificationType["VERIFICATION_APPROVED"] = "VERIFICATION_APPROVED";
    NotificationType["VERIFICATION_REJECTED"] = "VERIFICATION_REJECTED";
    NotificationType["CONTENT_APPROVED"] = "CONTENT_APPROVED";
    NotificationType["CONTENT_REJECTED"] = "CONTENT_REJECTED";
    NotificationType["CONTENT_FLAGGED"] = "CONTENT_FLAGGED";
    NotificationType["CONTENT_UNDER_REVIEW"] = "CONTENT_UNDER_REVIEW";
    NotificationType["UPLOAD_SUCCESSFUL"] = "UPLOAD_SUCCESSFUL";
    NotificationType["PURCHASE_MADE"] = "PURCHASE_MADE";
    NotificationType["PAYOUT_SENT"] = "PAYOUT_SENT";
    NotificationType["PAYOUT_FAILED"] = "PAYOUT_FAILED";
    NotificationType["PAYOUT_APPROVED"] = "PAYOUT_APPROVED";
    NotificationType["PAYOUT_REJECTED"] = "PAYOUT_REJECTED";
    NotificationType["PLATFORM_UPDATE"] = "PLATFORM_UPDATE";
    NotificationType["NEW_FEATURE"] = "NEW_FEATURE";
    NotificationType["POLICY_WARNING"] = "POLICY_WARNING";
    NotificationType["POLICY_UPDATE"] = "POLICY_UPDATE";
    NotificationType["SYSTEM_MAINTENANCE"] = "SYSTEM_MAINTENANCE";
    NotificationType["SUPPORT_TICKET_CREATED"] = "SUPPORT_TICKET_CREATED";
    NotificationType["SUPPORT_TICKET_RESOLVED"] = "SUPPORT_TICKET_RESOLVED";
    NotificationType["SUPPORT_REPLY"] = "SUPPORT_REPLY";
    NotificationType["NEW_CREATOR_SIGNUP"] = "NEW_CREATOR_SIGNUP";
    NotificationType["CONTENT_PENDING_REVIEW"] = "CONTENT_PENDING_REVIEW";
    NotificationType["VERIFICATION_PENDING"] = "VERIFICATION_PENDING";
    NotificationType["PAYOUT_REQUEST"] = "PAYOUT_REQUEST";
    NotificationType["FLAGGED_CONTENT_ALERT"] = "FLAGGED_CONTENT_ALERT";
    NotificationType["WELCOME"] = "WELCOME";
    NotificationType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(NotificationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-notification.dto.js.map