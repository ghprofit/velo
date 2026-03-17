import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ConfirmPurchaseDto {
  @IsString()
  @IsNotEmpty()
  purchaseId: string;

  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @IsOptional()
  @IsString()
  paymentProvider?: string;
}
