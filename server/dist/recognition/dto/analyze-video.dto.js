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
exports.GetVideoResultsDto = exports.VideoAnalysisResponseDto = exports.AnalyzeVideoDto = exports.VideoAnalysisOptionsDto = exports.NotificationChannelDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const analyze_image_dto_1 = require("./analyze-image.dto");
class NotificationChannelDto {
}
exports.NotificationChannelDto = NotificationChannelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationChannelDto.prototype, "snsTopicArn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationChannelDto.prototype, "roleArn", void 0);
class VideoAnalysisOptionsDto {
    constructor() {
        this.detectLabels = true;
        this.detectFaces = false;
        this.detectText = false;
        this.detectModerationLabels = false;
        this.detectCelebrities = false;
        this.detectPersons = false;
    }
}
exports.VideoAnalysisOptionsDto = VideoAnalysisOptionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VideoAnalysisOptionsDto.prototype, "detectLabels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VideoAnalysisOptionsDto.prototype, "detectFaces", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VideoAnalysisOptionsDto.prototype, "detectText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VideoAnalysisOptionsDto.prototype, "detectModerationLabels", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VideoAnalysisOptionsDto.prototype, "detectCelebrities", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VideoAnalysisOptionsDto.prototype, "detectPersons", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationChannelDto),
    __metadata("design:type", NotificationChannelDto)
], VideoAnalysisOptionsDto.prototype, "notificationChannel", void 0);
class AnalyzeVideoDto {
}
exports.AnalyzeVideoDto = AnalyzeVideoDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => analyze_image_dto_1.ContentSourceDto),
    __metadata("design:type", analyze_image_dto_1.ContentSourceDto)
], AnalyzeVideoDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VideoAnalysisOptionsDto),
    __metadata("design:type", VideoAnalysisOptionsDto)
], AnalyzeVideoDto.prototype, "options", void 0);
class VideoAnalysisResponseDto {
}
exports.VideoAnalysisResponseDto = VideoAnalysisResponseDto;
class GetVideoResultsDto {
}
exports.GetVideoResultsDto = GetVideoResultsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetVideoResultsDto.prototype, "jobId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetVideoResultsDto.prototype, "nextToken", void 0);
//# sourceMappingURL=analyze-video.dto.js.map