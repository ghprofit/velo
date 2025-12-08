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
exports.DocumentAnalysisResponseDto = exports.AnalyzeDocumentDto = exports.DocumentAnalysisOptionsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const analyze_image_dto_1 = require("./analyze-image.dto");
class DocumentAnalysisOptionsDto {
    constructor() {
        this.extractText = true;
        this.extractTables = false;
        this.extractForms = false;
        this.extractKeyValuePairs = false;
    }
}
exports.DocumentAnalysisOptionsDto = DocumentAnalysisOptionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DocumentAnalysisOptionsDto.prototype, "extractText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DocumentAnalysisOptionsDto.prototype, "extractTables", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DocumentAnalysisOptionsDto.prototype, "extractForms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DocumentAnalysisOptionsDto.prototype, "extractKeyValuePairs", void 0);
class AnalyzeDocumentDto {
}
exports.AnalyzeDocumentDto = AnalyzeDocumentDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => analyze_image_dto_1.ContentSourceDto),
    __metadata("design:type", analyze_image_dto_1.ContentSourceDto)
], AnalyzeDocumentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentAnalysisOptionsDto),
    __metadata("design:type", DocumentAnalysisOptionsDto)
], AnalyzeDocumentDto.prototype, "options", void 0);
class DocumentAnalysisResponseDto {
}
exports.DocumentAnalysisResponseDto = DocumentAnalysisResponseDto;
//# sourceMappingURL=analyze-document.dto.js.map