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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../s3/s3.service");
let SupportService = class SupportService {
    constructor(prisma, s3Service) {
        this.prisma = prisma;
        this.s3Service = s3Service;
        this.ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];
        this.MAX_FILE_SIZE = 5 * 1024 * 1024;
        this.MAX_TOTAL_SIZE = 20 * 1024 * 1024;
        this.MAX_FILE_COUNT = 5;
    }
    validateAttachments(attachments) {
        if (attachments.length > this.MAX_FILE_COUNT) {
            throw new common_1.BadRequestException(`Maximum ${this.MAX_FILE_COUNT} files allowed. You uploaded ${attachments.length} files.`);
        }
        let totalSize = 0;
        for (const attachment of attachments) {
            if (attachment.fileSize > this.MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`File "${attachment.fileName}" exceeds maximum size of 5MB`);
            }
            if (!this.ALLOWED_MIME_TYPES.includes(attachment.contentType)) {
                throw new common_1.BadRequestException(`File type "${attachment.contentType}" not allowed. Only JPEG, PNG, and MP4 files are accepted.`);
            }
            const fileExtension = attachment.fileName.split('.').pop()?.toLowerCase();
            const expectedExtensions = {
                'image/jpeg': ['jpg', 'jpeg'],
                'image/png': ['png'],
                'video/mp4': ['mp4'],
            };
            const validExtensions = expectedExtensions[attachment.contentType];
            if (!validExtensions?.includes(fileExtension || '')) {
                throw new common_1.BadRequestException(`File extension "${fileExtension}" does not match content type "${attachment.contentType}"`);
            }
            totalSize += attachment.fileSize;
        }
        if (totalSize > this.MAX_TOTAL_SIZE) {
            throw new common_1.BadRequestException(`Total file size exceeds maximum of 20MB. Current total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
        }
    }
    async uploadAttachments(attachments) {
        const uploadResults = [];
        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            if (!attachment)
                continue;
            const result = await this.s3Service.uploadFile(attachment.fileData, attachment.fileName, attachment.contentType, 'support-tickets');
            uploadResults.push({
                s3Key: result.key,
                s3Bucket: this.s3Service['bucketName'],
                fileName: attachment.fileName,
                fileSize: attachment.fileSize,
                contentType: attachment.contentType,
                order: i,
            });
        }
        return uploadResults;
    }
    async createTicket(userId, createTicketDto) {
        const uploadedS3Keys = [];
        try {
            let attachmentData = [];
            if (createTicketDto.attachments && createTicketDto.attachments.length > 0) {
                this.validateAttachments(createTicketDto.attachments);
                attachmentData = await this.uploadAttachments(createTicketDto.attachments);
                uploadedS3Keys.push(...attachmentData.map((a) => a.s3Key));
            }
            const ticket = await this.prisma.supportTicket.create({
                data: {
                    userId: userId || null,
                    email: createTicketDto.email,
                    subject: `[${createTicketDto.category}] ${createTicketDto.subject}`,
                    message: createTicketDto.contentId
                        ? `${createTicketDto.description}\n\nRelated Content ID: ${createTicketDto.contentId}`
                        : createTicketDto.description,
                    status: 'OPEN',
                    priority: 'MEDIUM',
                    attachments: {
                        create: attachmentData,
                    },
                },
                include: {
                    attachments: true,
                },
            });
            return {
                id: ticket.id,
                message: 'Support ticket created successfully',
                attachmentCount: ticket.attachments.length,
            };
        }
        catch (error) {
            if (uploadedS3Keys.length > 0) {
                try {
                    await this.s3Service.deleteMultipleFiles(uploadedS3Keys);
                }
                catch (cleanupError) {
                    console.error('Failed to cleanup S3 files after error:', cleanupError);
                }
            }
            throw error;
        }
    }
    async getUserTickets(userId) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                attachments: true,
            },
        });
    }
    async getTicketById(id, userId) {
        const where = { id };
        if (userId) {
            where.userId = userId;
        }
        return this.prisma.supportTicket.findUnique({
            where,
            include: {
                attachments: true,
            },
        });
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], SupportService);
//# sourceMappingURL=support.service.js.map