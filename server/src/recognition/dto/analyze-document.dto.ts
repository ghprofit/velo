import { IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentSourceDto } from './analyze-image.dto';

export class DocumentAnalysisOptionsDto {
  @IsOptional()
  @IsBoolean()
  extractText?: boolean = true;

  @IsOptional()
  @IsBoolean()
  extractTables?: boolean = false;

  @IsOptional()
  @IsBoolean()
  extractForms?: boolean = false;

  @IsOptional()
  @IsBoolean()
  extractKeyValuePairs?: boolean = false;
}

export class AnalyzeDocumentDto {
  @ValidateNested()
  @Type(() => ContentSourceDto)
  content: ContentSourceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentAnalysisOptionsDto)
  options?: DocumentAnalysisOptionsDto;
}

export class DocumentAnalysisResponseDto {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}
