import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class RequestPayoutDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(100, { message: 'Minimum payout amount is $100' })
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
