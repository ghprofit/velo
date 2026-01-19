import { IsString, IsArray, IsNumber, Min, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ContentItemDto {
  @IsString()
  s3Key: string;

  @IsString()
  type: string; // 'IMAGE' or 'VIDEO'

  @IsNumber()
  @Min(1)
  fileSize: number;
}

export class ConfirmUploadDto {
  @IsString()
  contentId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  thumbnailS3Key: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  items: ContentItemDto[];
}
