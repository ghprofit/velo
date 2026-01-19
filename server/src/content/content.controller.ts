import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateContentMultipartDto } from './dto/create-content-multipart.dto';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@Controller('content')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private contentService: ContentService) {}

  /**
   * Get presigned S3 upload URLs (bypasses API Gateway 10MB limit)
   */
  @Post('upload-urls')
  @UseGuards(JwtAuthGuard)
  async getUploadUrls(@Request() req: any, @Body() dto: GetUploadUrlDto) {
    try {
      const urls = await this.contentService.getPresignedUploadUrls(req.user.id, dto);
      return {
        success: true,
        data: urls,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to generate upload URLs: ${err.message}`, err.stack);
      throw new BadRequestException({
        success: false,
        message: err.message || 'Failed to generate upload URLs',
      });
    }
  }

  /**
   * Confirm S3 upload completion and create content record
   */
  @Post('confirm-upload')
  @UseGuards(JwtAuthGuard)
  async confirmUpload(@Request() req: any, @Body() dto: ConfirmUploadDto) {
    try {
      const result = await this.contentService.confirmDirectUpload(req.user.id, dto);
      return {
        success: true,
        message: 'Content uploaded successfully. Your content will be reviewed within 1-2 minutes.',
        data: result,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Upload confirmation failed: ${err.message}`, err.stack);
      throw new BadRequestException({
        success: false,
        message: err.message || 'Failed to confirm upload',
      });
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createContent(@Request() req: any, @Body() createContentDto: CreateContentDto) {
    try {
      const result = await this.contentService.createContent(req.user.id, createContentDto);
      return {
        success: true,
        message: 'Content created successfully',
        data: result,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Content creation failed: ${err.message}`, err.stack);

      // Return structured error response
      throw new BadRequestException({
        success: false,
        message: err.message || 'Failed to create content',
        error: err.name || 'ContentCreationError',
      });
    }
  }

  @Post('multipart')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'files', maxCount: 20 }, // Changed from 10 to 20
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 524288000, // 500MB per file
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
          } else {
            callback(
              new BadRequestException(
                `File type ${file.mimetype} is not supported`,
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async createContentMultipart(
    @Request() req: any,
    @Body() createContentDto: CreateContentMultipartDto,
    @UploadedFiles()
    uploadedFiles: {
      files?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    try {
      // Validate file count (1-20 files)
      if (!uploadedFiles.files || uploadedFiles.files.length === 0) {
        throw new BadRequestException('At least one content file is required');
      }

      if (uploadedFiles.files.length > 20) {
        throw new BadRequestException('Maximum 20 files allowed per upload');
      }

      if (!uploadedFiles.thumbnail || uploadedFiles.thumbnail.length === 0) {
        throw new BadRequestException('Thumbnail is required');
      }

      // Parse metadata
      const filesMetadata = createContentDto.filesMetadata
        ? JSON.parse(createContentDto.filesMetadata)
        : [];

      const result = await this.contentService.createContentMultipart(
        req.user.id,
        createContentDto,
        uploadedFiles.files,
        uploadedFiles.thumbnail![0]!,
        filesMetadata,
      );

      return {
        success: true,
        message: 'Content created successfully',
        data: result,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Content creation failed: ${err.message}`, err.stack);

      throw new BadRequestException({
        success: false,
        message: err.message || 'Failed to create content',
        error: err.name || 'ContentCreationError',
      });
    }
  }

  @Get('my-content')
  @UseGuards(JwtAuthGuard)
  async getMyContent(@Request() req: any) {
    const content = await this.contentService.getCreatorContent(req.user.id);
    return {
      success: true,
      data: content,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getContentStats(@Request() req: any) {
    const stats = await this.contentService.getContentStats(req.user.id);
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async getContentById(@Param('id') id: string) {
    const content = await this.contentService.getContentById(id);
    return {
      success: true,
      data: content,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteContent(@Request() req: any, @Param('id') id: string) {
    const result = await this.contentService.deleteContent(req.user.id, id);
    return {
      success: true,
      message: result.message,
    };
  }
}
