import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class UpdateContentDto {
  @IsString()
  @IsOptional()
  status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'REMOVED';

  @IsString()
  @IsOptional()
  complianceStatus?: 'PENDING' | 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';

  @IsString()
  @IsOptional()
  complianceNotes?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class ReviewContentDto {
  @IsEnum(['APPROVED', 'REJECTED', 'FLAGGED'])
  decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class RemoveContentDto {
  @IsString()
  reason: string;

  @IsBoolean()
  @IsOptional()
  notifyCreator?: boolean = true;
}
