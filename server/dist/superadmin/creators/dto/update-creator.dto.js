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
exports.SuspendCreatorDto = exports.AddStrikeDto = exports.UpdateCreatorDto = exports.VerificationStatusDto = exports.PayoutStatusDto = void 0;
const class_validator_1 = require("class-validator");
var PayoutStatusDto;
(function (PayoutStatusDto) {
    PayoutStatusDto["ACTIVE"] = "ACTIVE";
    PayoutStatusDto["ON_HOLD"] = "ON_HOLD";
    PayoutStatusDto["SUSPENDED"] = "SUSPENDED";
})(PayoutStatusDto || (exports.PayoutStatusDto = PayoutStatusDto = {}));
var VerificationStatusDto;
(function (VerificationStatusDto) {
    VerificationStatusDto["PENDING"] = "PENDING";
    VerificationStatusDto["IN_PROGRESS"] = "IN_PROGRESS";
    VerificationStatusDto["VERIFIED"] = "VERIFIED";
    VerificationStatusDto["REJECTED"] = "REJECTED";
})(VerificationStatusDto || (exports.VerificationStatusDto = VerificationStatusDto = {}));
class UpdateCreatorDto {
}
exports.UpdateCreatorDto = UpdateCreatorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCreatorDto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PayoutStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCreatorDto.prototype, "payoutStatus", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(VerificationStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCreatorDto.prototype, "verificationStatus", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCreatorDto.prototype, "policyStrikes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCreatorDto.prototype, "verificationNotes", void 0);
class AddStrikeDto {
}
exports.AddStrikeDto = AddStrikeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddStrikeDto.prototype, "reason", void 0);
class SuspendCreatorDto {
}
exports.SuspendCreatorDto = SuspendCreatorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuspendCreatorDto.prototype, "reason", void 0);
//# sourceMappingURL=update-creator.dto.js.map