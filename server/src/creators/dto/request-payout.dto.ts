import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class RequestPayoutDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(10, { message: 'Minimum payout amount is $10' })
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
