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
  @Matches(/^[A-Za-z0-9]{4,34}$/, {
    message: 'Bank account number must be 4-34 alphanumeric characters',
  })
  bankAccountNumber: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{6}([0-9]{3})?$/, {
    message: 'Must be a 6-digit sort code or 9-digit routing number',
  })
  bankRoutingNumber?: string; // For US routing (9 digits) or sort code (6 digits)

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

  @IsString()
  @IsOptional()
  streetAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class BankAccountResponseDto {
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string; // Last 4 digits only
  bankCountry: string;
  bankCurrency: string;
  payoutSetupCompleted: boolean;
  stripeAccountId?: string;
  // Creator's personal address
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}
