import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SourceType {
  BASE64 = 'base64',
  URL = 'url',
  S3 = 's3',
}

export class ContentSourceDto {
  @IsEnum(SourceType)
  type: SourceType;

  @IsNotEmpty()
  @IsString()
  data: string;

  @IsOptional()
  @IsString()
  bucket?: string;
}

export class ImageAnalysisOptionsDto {
  @IsOptional()
  @IsBoolean()
  detectLabels?: boolean = true;

  @IsOptional()
  @IsBoolean()
  detectFaces?: boolean = false;

  @IsOptional()
  @IsBoolean()
  detectText?: boolean = false;

  @IsOptional()
  @IsBoolean()
  detectModerationLabels?: boolean = false;

  @IsOptional()
  @IsBoolean()
  detectCelebrities?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxLabels?: number = 100;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minConfidence?: number = 50;
}

export class AnalyzeImageDto {
  @ValidateNested()
  @Type(() => ContentSourceDto)
  content: ContentSourceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageAnalysisOptionsDto)
  options?: ImageAnalysisOptionsDto;
}

export class ImageAnalysisResponseDto {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}
