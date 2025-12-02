import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentSourceDto, ImageAnalysisOptionsDto } from './analyze-image.dto';
import { VideoAnalysisOptionsDto } from './analyze-video.dto';
import { DocumentAnalysisOptionsDto } from './analyze-document.dto';

export enum ContentTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export class BatchItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => ContentSourceDto)
  content: ContentSourceDto;

  @IsEnum(ContentTypeEnum)
  contentType: ContentTypeEnum;

  @IsOptional()
  options?:
    | ImageAnalysisOptionsDto
    | VideoAnalysisOptionsDto
    | DocumentAnalysisOptionsDto;
}

export class BatchAnalyzeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];
}

export class BatchAnalysisResponseDto {
  success: boolean;
  totalItems: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    id: string;
    success: boolean;
    contentType: string;
    result?: any;
    error?: string;
  }>;
  timestamp: Date;
}
