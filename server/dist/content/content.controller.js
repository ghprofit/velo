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
var ContentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const content_service_1 = require("./content.service");
const create_content_dto_1 = require("./dto/create-content.dto");
const create_content_multipart_dto_1 = require("./dto/create-content-multipart.dto");
let ContentController = ContentController_1 = class ContentController {
    constructor(contentService) {
        this.contentService = contentService;
        this.logger = new common_1.Logger(ContentController_1.name);
    }
    async createContent(req, createContentDto) {
        try {
            const result = await this.contentService.createContent(req.user.id, createContentDto);
            return {
                success: true,
                message: 'Content created successfully',
                data: result,
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Content creation failed: ${err.message}`, err.stack);
            throw new common_1.BadRequestException({
                success: false,
                message: err.message || 'Failed to create content',
                error: err.name || 'ContentCreationError',
            });
        }
    }
    async createContentMultipart(req, createContentDto, uploadedFiles) {
        try {
            if (!uploadedFiles.files || uploadedFiles.files.length === 0) {
                throw new common_1.BadRequestException('At least one content file is required');
            }
            if (uploadedFiles.files.length > 20) {
                throw new common_1.BadRequestException('Maximum 20 files allowed per upload');
            }
            if (!uploadedFiles.thumbnail || uploadedFiles.thumbnail.length === 0) {
                throw new common_1.BadRequestException('Thumbnail is required');
            }
            const filesMetadata = createContentDto.filesMetadata
                ? JSON.parse(createContentDto.filesMetadata)
                : [];
            const result = await this.contentService.createContentMultipart(req.user.id, createContentDto, uploadedFiles.files, uploadedFiles.thumbnail[0], filesMetadata);
            return {
                success: true,
                message: 'Content created successfully',
                data: result,
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Content creation failed: ${err.message}`, err.stack);
            throw new common_1.BadRequestException({
                success: false,
                message: err.message || 'Failed to create content',
                error: err.name || 'ContentCreationError',
            });
        }
    }
    async getMyContent(req) {
        const content = await this.contentService.getCreatorContent(req.user.id);
        return {
            success: true,
            data: content,
        };
    }
    async getContentStats(req) {
        const stats = await this.contentService.getContentStats(req.user.id);
        return {
            success: true,
            data: stats,
        };
    }
    async getContentById(id) {
        const content = await this.contentService.getContentById(id);
        return {
            success: true,
            data: content,
        };
    }
    async deleteContent(req, id) {
        const result = await this.contentService.deleteContent(req.user.id, id);
        return {
            success: true,
            message: result.message,
        };
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_content_dto_1.CreateContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createContent", null);
__decorate([
    (0, common_1.Post)('multipart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'files', maxCount: 20 },
        { name: 'thumbnail', maxCount: 1 },
    ], {
        limits: {
            fileSize: 524288000,
        },
        fileFilter: (req, file, callback) => {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'video/mp4',
                'video/quicktime',
                'video/x-msvideo',
                'video/webm',
            ];
            if (allowedTypes.includes(file.mimetype)) {
                callback(null, true);
            }
            else {
                callback(new common_1.BadRequestException(`File type ${file.mimetype} is not supported`), false);
            }
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_content_multipart_dto_1.CreateContentMultipartDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createContentMultipart", null);
__decorate([
    (0, common_1.Get)('my-content'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getMyContent", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getContentStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getContentById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "deleteContent", null);
exports.ContentController = ContentController = ContentController_1 = __decorate([
    (0, common_1.Controller)('content'),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map