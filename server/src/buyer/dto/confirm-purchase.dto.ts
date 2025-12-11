import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmPurchaseDto {
  @IsString()
  @IsNotEmpty()
  purchaseId: string;

  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}
