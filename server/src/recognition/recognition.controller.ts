import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RecognitionService, ContentSource } from './recognition.service';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTOs
enum SourceType {
  BASE64 = 'base64',
  URL = 'url',
  S3 = 's3',
}

class ContentSourceDto {
  @IsEnum(SourceType)
  type: SourceType;

  @IsNotEmpty()
  @IsString()
  data: string;

  @IsOptional()
  @IsString()
  bucket?: string;
}

class CheckSafetyDto {
  @ValidateNested()
  @Type(() => ContentSourceDto)
  content: ContentSourceDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minConfidence?: number;
}

class BatchItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => ContentSourceDto)
  content: ContentSourceDto;
}

class BatchCheckSafetyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minConfidence?: number;
}

class VideoSafetyDto {
  @ValidateNested()
  @Type(() => ContentSourceDto)
  content: ContentSourceDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minConfidence?: number;
}

@Controller('recognition')
export class RecognitionController {
  private readonly logger = new Logger(RecognitionController.name);

  constructor(private readonly recognitionService: RecognitionService) {}

  /**
   * Check if single image/content is safe
   * POST /recognition/check
   */
  @Post('check')
  @HttpCode(HttpStatus.OK)
  async checkSafety(@Body() dto: CheckSafetyDto) {
    this.logger.log('Checking content safety');

    try {
      const content: ContentSource = {
        type: dto.content.type,
        data: dto.content.data,
        bucket: dto.content.bucket,
      };

      const result = await this.recognitionService.checkImageSafety(
        content,
        dto.minConfidence || 50,
      );

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
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        isSafe: false,
        error: err.message || 'Safety check failed',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Quick check - just returns safe/unsafe
   * POST /recognition/is-safe
   */
  @Post('is-safe')
  @HttpCode(HttpStatus.OK)
  async isSafe(@Body() dto: CheckSafetyDto) {
    this.logger.log('Quick safety check');

    try {
      const content: ContentSource = {
        type: dto.content.type,
        data: dto.content.data,
        bucket: dto.content.bucket,
      };

      const isSafe = await this.recognitionService.isContentSafe(
        content,
        dto.minConfidence || 50,
      );

      return {
        success: true,
        isSafe,
        message: isSafe ? 'Content is safe' : 'Content is unsafe',
        timestamp: new Date(),
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        isSafe: false,
        error: err.message || 'Safety check failed',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Batch check multiple images for safety
   * POST /recognition/check-batch
   */
  @Post('check-batch')
  @HttpCode(HttpStatus.OK)
  async checkBatchSafety(@Body() dto: BatchCheckSafetyDto) {
    this.logger.log(`Batch checking ${dto.items.length} items`);

    try {
      const items = dto.items.map((item) => ({
        id: item.id,
        content: {
          type: item.content.type,
          data: item.content.data,
          bucket: item.content.bucket,
        } as ContentSource,
      }));

      const result = await this.recognitionService.checkBatchSafety(
        items,
        dto.minConfidence || 50,
      );

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
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message || 'Batch safety check failed',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Start video safety check (async)
   * POST /recognition/check-video
   */
  @Post('check-video')
  @HttpCode(HttpStatus.OK)
  async checkVideoSafety(@Body() dto: VideoSafetyDto) {
    this.logger.log('Starting video safety check');

    try {
      const content: ContentSource = {
        type: dto.content.type,
        data: dto.content.data,
        bucket: dto.content.bucket,
      };

      const result = await this.recognitionService.startVideoSafetyCheck(
        content,
        dto.minConfidence || 50,
      );

      return {
        success: true,
        jobId: result.jobId,
        status: result.status,
        message: 'Video safety check started. Poll /recognition/video/:jobId for results.',
        timestamp: new Date(),
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message || 'Video safety check failed',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get video safety check results
   * GET /recognition/video/:jobId
   */
  @Get('video/:jobId')
  @HttpCode(HttpStatus.OK)
  async getVideoSafetyResults(
    @Param('jobId') jobId: string,
    @Query('nextToken') nextToken?: string,
  ) {
    this.logger.log(`Getting video safety results for job: ${jobId}`);

    try {
      const result = await this.recognitionService.getVideoSafetyResults(
        jobId,
        nextToken,
      );

      return {
        success: true,
        jobId: result.jobId,
        status: result.status,
        statusMessage: result.statusMessage,
        isSafe: result.isSafe,
        unsafeSegmentsCount: result.unsafeSegments?.length || 0,
        unsafeSegments: result.unsafeSegments,
        message:
          result.status === 'SUCCEEDED'
            ? result.isSafe
              ? 'Video is safe'
              : `Video contains ${result.unsafeSegments?.length || 0} unsafe segments`
            : `Job status: ${result.status}`,
        timestamp: new Date(),
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message || 'Failed to get video results',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get list of safety categories that are detected
   * GET /recognition/categories
   */
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  getCategories() {
    const categories = this.recognitionService.getSafetyCategories();
    return {
      success: true,
      categories,
      description: 'Content will be flagged if it contains any of these categories',
      timestamp: new Date(),
    };
  }

  /**
   * Health check
   * GET /recognition/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
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
}
