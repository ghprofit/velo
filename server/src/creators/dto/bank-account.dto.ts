import { IsString, IsOptional, IsNotEmpty, MinLength, Matches } from 'class-validator';

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
  @Matches(/^[0-9]{4,17}$/, {
    message: 'Bank account number must be 4-17 digits',
  })
  bankAccountNumber: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{9}$/, {
    message: 'Routing number must be exactly 9 digits',
  })
  bankRoutingNumber?: string; // For US banks

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, {
    message: 'SWIFT code must be 8 or 11 characters (e.g., BOFAUS3N)',
  })
  bankSwiftCode?: string; // For international transfers

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, {
    message: 'Invalid IBAN format',
  })
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
