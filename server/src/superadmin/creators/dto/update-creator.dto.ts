import { IsString, IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';

export enum PayoutStatusDto {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  SUSPENDED = 'SUSPENDED',
}

export enum VerificationStatusDto {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class UpdateCreatorDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsEnum(PayoutStatusDto)
  @IsOptional()
  payoutStatus?: PayoutStatusDto;

  @IsEnum(VerificationStatusDto)
  @IsOptional()
  verificationStatus?: VerificationStatusDto;

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  policyStrikes?: number;

  @IsString()
  @IsOptional()
  verificationNotes?: string;
}

export class AddStrikeDto {
  @IsString()
  reason: string;
}

export class SuspendCreatorDto {
  @IsString()
  reason: string;
}
