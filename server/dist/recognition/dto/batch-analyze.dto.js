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
exports.BatchAnalysisResponseDto = exports.BatchAnalyzeDto = exports.BatchItemDto = exports.ContentTypeEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const analyze_image_dto_1 = require("./analyze-image.dto");
var ContentTypeEnum;
(function (ContentTypeEnum) {
    ContentTypeEnum["IMAGE"] = "image";
    ContentTypeEnum["VIDEO"] = "video";
    ContentTypeEnum["DOCUMENT"] = "document";
})(ContentTypeEnum || (exports.ContentTypeEnum = ContentTypeEnum = {}));
class BatchItemDto {
}
exports.BatchItemDto = BatchItemDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => analyze_image_dto_1.ContentSourceDto),
    __metadata("design:type", analyze_image_dto_1.ContentSourceDto)
], BatchItemDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ContentTypeEnum),
    __metadata("design:type", String)
], BatchItemDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BatchItemDto.prototype, "options", void 0);
class BatchAnalyzeDto {
}
exports.BatchAnalyzeDto = BatchAnalyzeDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BatchItemDto),
    __metadata("design:type", Array)
], BatchAnalyzeDto.prototype, "items", void 0);
class BatchAnalysisResponseDto {
}
exports.BatchAnalysisResponseDto = BatchAnalysisResponseDto;
//# sourceMappingURL=batch-analyze.dto.js.map