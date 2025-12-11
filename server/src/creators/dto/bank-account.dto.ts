import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class SetupBankAccountDto {
  @IsString()
  @IsNotEmpty()
  bankAccountName: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  bankAccountNumber: string;

  @IsString()
  @IsOptional()
  bankRoutingNumber?: string; // For US banks

  @IsString()
  @IsOptional()
  bankSwiftCode?: string; // For international transfers

  @IsString()
  @IsOptional()
  bankIban?: string; // For European banks

  @IsString()
  @IsNotEmpty()
  bankCountry: string;

  @IsString()
  @IsOptional()
  bankCurrency?: string; // Defaults to USD
}

export class BankAccountResponseDto {
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string; // Last 4 digits only
  bankCountry: string;
  bankCurrency: string;
  payoutSetupCompleted: boolean;
}
