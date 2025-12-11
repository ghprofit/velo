import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCreatorsDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  kycStatus?: 'all' | 'VERIFIED' | 'PENDING' | 'REJECTED' | 'IN_PROGRESS';

  @IsString()
  @IsOptional()
  payoutStatus?: 'all' | 'ACTIVE' | 'ON_HOLD' | 'SUSPENDED';

  @IsString()
  @IsOptional()
  strikes?: 'all' | '0' | '1' | '2' | '3+';

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
