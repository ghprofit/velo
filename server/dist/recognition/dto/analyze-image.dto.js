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
exports.ImageAnalysisResponseDto = exports.AnalyzeImageDto = exports.ImageAnalysisOptionsDto = exports.ContentSourceDto = exports.SourceType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SourceType;
(function (SourceType) {
    SourceType["BASE64"] = "base64";
    SourceType["URL"] = "url";
    SourceType["S3"] = "s3";
})(SourceType || (exports.SourceType = SourceType = {}));
class ContentSourceDto {
}
exports.ContentSourceDto = ContentSourceDto;
__decorate([
    (0, class_validator_1.IsEnum)(SourceType),
    __metadata("design:type", String)
], ContentSourceDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentSourceDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContentSourceDto.prototype, "bucket", void 0);
class ImageAnalysisOptionsDto {
    constructor() {
        this.detectLabels = true;
        this.detectFaces = false;
        this.detectText = false;
        this.detectModerationLabels = false;
        this.detectCelebrities = false;
        this.maxLabels = 100;
        this.minConfidence = 50;
    }
}
exports.ImageAnalysisOptionsDto = ImageAnalysisOptionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImageAnalysisOptionsDto.prototype, "detectLabels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImageAnalysisOptionsDto.prototype, "detectFaces", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImageAnalysisOptionsDto.prototype, "detectText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImageAnalysisOptionsDto.prototype, "detectModerationLabels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImageAnalysisOptionsDto.prototype, "detectCelebrities", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], ImageAnalysisOptionsDto.prototype, "maxLabels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ImageAnalysisOptionsDto.prototype, "minConfidence", void 0);
class AnalyzeImageDto {
}
exports.AnalyzeImageDto = AnalyzeImageDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContentSourceDto),
    __metadata("design:type", ContentSourceDto)
], AnalyzeImageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ImageAnalysisOptionsDto),
    __metadata("design:type", ImageAnalysisOptionsDto)
], AnalyzeImageDto.prototype, "options", void 0);
class ImageAnalysisResponseDto {
}
exports.ImageAnalysisResponseDto = ImageAnalysisResponseDto;
//# sourceMappingURL=analyze-image.dto.js.map