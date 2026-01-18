import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class RequestPayoutDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(50, { message: 'Minimum payout amount is $50' })
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
