import { IsString, IsEnum, IsNumber, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ContentFileDto {
  @IsString()
  fileName: string;

  @IsString()
  contentType: string;

  @IsNumber()
  @Min(1)
  fileSize: number;

  @IsEnum(['IMAGE', 'VIDEO'])
  type: 'IMAGE' | 'VIDEO';
}

export class GetUploadUrlDto {
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
  thumbnailFileName: string;

  @IsString()
  thumbnailContentType: string;

  @IsNumber()
  @Min(1)
  thumbnailFileSize: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentFileDto)
  contentFiles: ContentFileDto[];
}

