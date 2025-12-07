import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AttachmentDto } from './dto/attachment.dto';

@Injectable()
export class SupportService {
  private readonly ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB
  private readonly MAX_FILE_COUNT = 5;

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  /**
   * Validate attachment files
   */
  private validateAttachments(attachments: AttachmentDto[]): void {
    // Check file count
    if (attachments.length > this.MAX_FILE_COUNT) {
      throw new BadRequestException(
        `Maximum ${this.MAX_FILE_COUNT} files allowed. You uploaded ${attachments.length} files.`,
      );
    }

    // Calculate total size and validate each file
    let totalSize = 0;
    for (const attachment of attachments) {
      // Validate file size
      if (attachment.fileSize > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File "${attachment.fileName}" exceeds maximum size of 5MB`,
        );
      }

      // Validate MIME type
      if (!this.ALLOWED_MIME_TYPES.includes(attachment.contentType)) {
        throw new BadRequestException(
          `File type "${attachment.contentType}" not allowed. Only JPEG, PNG, and MP4 files are accepted.`,
        );
      }

      // Validate file extension matches MIME type
      const fileExtension = attachment.fileName.split('.').pop()?.toLowerCase();
      const expectedExtensions: Record<string, string[]> = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'video/mp4': ['mp4'],
      };

      const validExtensions = expectedExtensions[attachment.contentType];
      if (!validExtensions?.includes(fileExtension || '')) {
        throw new BadRequestException(
          `File extension "${fileExtension}" does not match content type "${attachment.contentType}"`,
        );
      }

      totalSize += attachment.fileSize;
    }

    // Check total size
    if (totalSize > this.MAX_TOTAL_SIZE) {
      throw new BadRequestException(
        `Total file size exceeds maximum of 20MB. Current total: ${(totalSize / 1024 / 1024).toFixed(2)}MB`,
      );
    }
  }

  /**
   * Upload attachments to S3
   */
  private async uploadAttachments(
    attachments: AttachmentDto[],
  ): Promise<Array<{ s3Key: string; s3Bucket: string; fileName: string; fileSize: number; contentType: string; order: number }>> {
    const uploadResults = [];

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];

      if (!attachment) continue;

      const result = await this.s3Service.uploadFile(
        attachment.fileData,
        attachment.fileName,
        attachment.contentType,
        'support-tickets',
      );

      uploadResults.push({
        s3Key: result.key,
        s3Bucket: this.s3Service['bucketName'], // Access bucket name from S3Service
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        contentType: attachment.contentType,
        order: i,
      });
    }

    return uploadResults;
  }

  async createTicket(userId: string | undefined, createTicketDto: CreateTicketDto) {
    const uploadedS3Keys: string[] = [];

    try {
      // Validate and upload attachments if present
      let attachmentData: Array<{
        s3Key: string;
        s3Bucket: string;
        fileName: string;
        fileSize: number;
        contentType: string;
        order: number;
      }> = [];

      if (createTicketDto.attachments && createTicketDto.attachments.length > 0) {
        // Validate attachments
        this.validateAttachments(createTicketDto.attachments);

        // Upload to S3
        attachmentData = await this.uploadAttachments(createTicketDto.attachments);

        // Track uploaded keys for potential cleanup
        uploadedS3Keys.push(...attachmentData.map((a) => a.s3Key));
      }

      // Create ticket with attachments in a transaction
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
    } catch (error) {
      // CRITICAL: Cleanup S3 files if database operation fails
      if (uploadedS3Keys.length > 0) {
        try {
          await this.s3Service.deleteMultipleFiles(uploadedS3Keys);
        } catch (cleanupError) {
          console.error('Failed to cleanup S3 files after error:', cleanupError);
        }
      }

      throw error;
    }
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        attachments: true,
      },
    });
  }

  async getTicketById(id: string, userId?: string) {
    const where: any = { id };
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
}
