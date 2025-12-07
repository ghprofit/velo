import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryContentDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: 'all' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'REMOVED';

  @IsString()
  @IsOptional()
  complianceStatus?: 'all' | 'PENDING' | 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';

  @IsString()
  @IsOptional()
  contentType?: 'all' | 'VIDEO' | 'IMAGE' | 'GALLERY';

  @IsString()
  @IsOptional()
  severity?: 'all' | 'HIGH' | 'MEDIUM' | 'LOW';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
