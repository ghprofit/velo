import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ApprovePayoutRequestDto {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class RejectPayoutRequestDto {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  reviewNotes: string; // Required for rejection
}
