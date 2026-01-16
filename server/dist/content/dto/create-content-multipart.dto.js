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
exports.CreateContentMultipartDto = exports.IsValidPriceConstraint = void 0;
const class_validator_1 = require("class-validator");
let IsValidPriceConstraint = class IsValidPriceConstraint {
    validate(price, args) {
        if (!Number.isFinite(price)) {
            return false;
        }
        const priceString = price.toString();
        const decimalIndex = priceString.indexOf('.');
        if (decimalIndex === -1) {
            return true;
        }
        const decimalPlaces = priceString.length - decimalIndex - 1;
        return decimalPlaces <= 2;
    }
    defaultMessage(args) {
        return 'Price must have at most 2 decimal places (e.g., 9.99, not 9.999)';
    }
};
exports.IsValidPriceConstraint = IsValidPriceConstraint;
exports.IsValidPriceConstraint = IsValidPriceConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidPrice', async: false })
], IsValidPriceConstraint);
class CreateContentMultipartDto {
}
exports.CreateContentMultipartDto = CreateContentMultipartDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentMultipartDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContentMultipartDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.Max)(10000),
    (0, class_validator_1.Validate)(IsValidPriceConstraint),
    __metadata("design:type", Number)
], CreateContentMultipartDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContentMultipartDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContentMultipartDto.prototype, "filesMetadata", void 0);
//# sourceMappingURL=create-content-multipart.dto.js.map