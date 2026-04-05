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
exports.RemoveContentDto = exports.ReviewContentDto = exports.UpdateContentDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateContentDto {
}
exports.UpdateContentDto = UpdateContentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateContentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateContentDto.prototype, "complianceStatus", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateContentDto.prototype, "complianceNotes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateContentDto.prototype, "isPublished", void 0);
class ReviewContentDto {
}
exports.ReviewContentDto = ReviewContentDto;
__decorate([
    (0, class_validator_1.IsEnum)(['APPROVED', 'REJECTED', 'FLAGGED']),
    __metadata("design:type", String)
], ReviewContentDto.prototype, "decision", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReviewContentDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReviewContentDto.prototype, "reason", void 0);
class RemoveContentDto {
    constructor() {
        this.notifyCreator = true;
    }
}
exports.RemoveContentDto = RemoveContentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RemoveContentDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RemoveContentDto.prototype, "notifyCreator", void 0);
//# sourceMappingURL=update-content.dto.js.map