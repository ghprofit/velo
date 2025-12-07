import { IsString, IsNumber, IsArray, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ContentItemDto {
  @IsString()
  fileData: string; // Base64 encoded file

  @IsString()
  fileName: string;

  @IsString()
  contentType: string; // image/jpeg, image/png, video/mp4, etc.

  @IsNumber()
  fileSize: number;

  @IsNumber()
  @IsOptional()
  duration?: number; // For videos
}

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Max(10000)
  price: number;

  @IsString()
  contentType: string; // 'IMAGE', 'VIDEO', 'GALLERY'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  items: ContentItemDto[];

  @IsString()
  thumbnailData: string; // Base64 encoded thumbnail
}
