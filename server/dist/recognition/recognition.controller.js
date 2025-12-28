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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RecognitionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecognitionController = void 0;
const common_1 = require("@nestjs/common");
const recognition_service_1 = require("./recognition.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SourceType;
(function (SourceType) {
    SourceType["BASE64"] = "base64";
    SourceType["URL"] = "url";
    SourceType["S3"] = "s3";
})(SourceType || (SourceType = {}));
class ContentSourceDto {
}
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
class CheckSafetyDto {
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContentSourceDto),
    __metadata("design:type", ContentSourceDto)
], CheckSafetyDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CheckSafetyDto.prototype, "minConfidence", void 0);
class BatchItemDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContentSourceDto),
    __metadata("design:type", ContentSourceDto)
], BatchItemDto.prototype, "content", void 0);
class BatchCheckSafetyDto {
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BatchItemDto),
    __metadata("design:type", Array)
], BatchCheckSafetyDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], BatchCheckSafetyDto.prototype, "minConfidence", void 0);
class VideoSafetyDto {
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContentSourceDto),
    __metadata("design:type", ContentSourceDto)
], VideoSafetyDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], VideoSafetyDto.prototype, "minConfidence", void 0);
let RecognitionController = RecognitionController_1 = class RecognitionController {
    constructor(recognitionService) {
        this.recognitionService = recognitionService;
        this.logger = new common_1.Logger(RecognitionController_1.name);
    }
    async checkSafety(dto) {
        this.logger.log('Checking content safety');
        try {
            const content = {
                type: dto.content.type,
                data: dto.content.data,
                bucket: dto.content.bucket,
            };
            const result = await this.recognitionService.checkImageSafety(content, dto.minConfidence || 50);
            return {
                success: true,
                isSafe: result.isSafe,
                confidence: result.confidence,
                flaggedCategories: result.flaggedCategories,
                moderationLabels: result.moderationLabels,
                message: result.isSafe
                    ? 'Content is safe'
                    : `Content flagged for: ${result.flaggedCategories.join(', ')}`,
                timestamp: result.timestamp,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Safety check failed';
            return {
                success: false,
                isSafe: false,
                error: errorMessage,
                timestamp: new Date(),
            };
        }
    }
    async isSafe(dto) {
        this.logger.log('Quick safety check');
        try {
            const content = {
                type: dto.content.type,
                data: dto.content.data,
                bucket: dto.content.bucket,
            };
            const isSafe = await this.recognitionService.isContentSafe(content, dto.minConfidence || 50);
            return {
                success: true,
                isSafe,
                message: isSafe ? 'Content is safe' : 'Content is unsafe',
                timestamp: new Date(),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Safety check failed';
            return {
                success: false,
                isSafe: false,
                error: errorMessage,
                timestamp: new Date(),
            };
        }
    }
    async checkBatchSafety(dto) {
        this.logger.log(`Batch checking ${dto.items.length} items`);
        try {
            const items = dto.items.map((item) => ({
                id: item.id,
                content: {
                    type: item.content.type,
                    data: item.content.data,
                    bucket: item.content.bucket,
                },
            }));
            const result = await this.recognitionService.checkBatchSafety(items, dto.minConfidence || 50);
            return {
                success: true,
                totalItems: result.totalItems,
                safeCount: result.safeCount,
                unsafeCount: result.unsafeCount,
                allSafe: result.unsafeCount === 0,
                results: result.results,
                message: `${result.safeCount}/${result.totalItems} items are safe`,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Batch safety check failed';
            return {
                success: false,
                error: errorMessage,
                timestamp: new Date(),
            };
        }
    }
    async checkVideoSafety(dto) {
        this.logger.log('Starting video safety check');
        try {
            const content = {
                type: dto.content.type,
                data: dto.content.data,
                bucket: dto.content.bucket,
            };
            const result = await this.recognitionService.startVideoSafetyCheck(content, dto.minConfidence || 50);
            return {
                success: true,
                jobId: result.jobId,
                status: result.status,
                message: 'Video safety check started. Poll /recognition/video/:jobId for results.',
                timestamp: new Date(),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Video safety check failed';
            return {
                success: false,
                error: errorMessage,
                timestamp: new Date(),
            };
        }
    }
    async getVideoSafetyResults(jobId, nextToken) {
        this.logger.log(`Getting video safety results for job: ${jobId}`);
        try {
            const result = await this.recognitionService.getVideoSafetyResults(jobId, nextToken);
            return {
                success: true,
                jobId: result.jobId,
                status: result.status,
                statusMessage: result.statusMessage,
                isSafe: result.isSafe,
                unsafeSegmentsCount: result.unsafeSegments?.length || 0,
                unsafeSegments: result.unsafeSegments,
                message: result.status === 'SUCCEEDED'
                    ? result.isSafe
                        ? 'Video is safe'
                        : `Video contains ${result.unsafeSegments?.length || 0} unsafe segments`
                    : `Job status: ${result.status}`,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get video results';
            return {
                success: false,
                error: errorMessage,
                timestamp: new Date(),
            };
        }
    }
    getCategories() {
        const categories = this.recognitionService.getSafetyCategories();
        return {
            success: true,
            categories,
            description: 'Content will be flagged if it contains any of these categories',
            timestamp: new Date(),
        };
    }
    async healthCheck() {
        const health = await this.recognitionService.healthCheck();
        return {
            ...health,
            service: 'Content Safety Service',
            provider: 'AWS Rekognition',
            purpose: 'Detect explicit, violent, and disturbing content',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.RecognitionController = RecognitionController;
__decorate([
    (0, common_1.Post)('check'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CheckSafetyDto]),
    __metadata("design:returntype", Promise)
], RecognitionController.prototype, "checkSafety", null);
__decorate([
    (0, common_1.Post)('is-safe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CheckSafetyDto]),
    __metadata("design:returntype", Promise)
], RecognitionController.prototype, "isSafe", null);
__decorate([
    (0, common_1.Post)('check-batch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchCheckSafetyDto]),
    __metadata("design:returntype", Promise)
], RecognitionController.prototype, "checkBatchSafety", null);
__decorate([
    (0, common_1.Post)('check-video'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VideoSafetyDto]),
    __metadata("design:returntype", Promise)
], RecognitionController.prototype, "checkVideoSafety", null);
__decorate([
    (0, common_1.Get)('video/:jobId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Query)('nextToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecognitionController.prototype, "getVideoSafetyResults", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecognitionController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecognitionController.prototype, "healthCheck", null);
exports.RecognitionController = RecognitionController = RecognitionController_1 = __decorate([
    (0, common_1.Controller)('recognition'),
    __metadata("design:paramtypes", [recognition_service_1.RecognitionService])
], RecognitionController);
//# sourceMappingURL=recognition.controller.js.map